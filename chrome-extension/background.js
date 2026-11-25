// Background service worker for context menu and downloads

const API_BASE_URL = 'https://aatifraza.cloud/api';

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'downloadMedia',
    title: 'Download with Social Media Downloader',
    contexts: ['link', 'page'],
    documentUrlPatterns: [
      'https://www.instagram.com/*',
      'https://instagram.com/*',
      'https://www.youtube.com/*',
      'https://youtube.com/*',
      'https://twitter.com/*',
      'https://x.com/*'
    ]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'downloadMedia') {
    const url = info.linkUrl || info.pageUrl;
    
    // Send message to content script to show download UI
    chrome.tabs.sendMessage(tab.id, {
      action: 'showDownloadUI',
      url: url
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeMedia') {
    analyzeMedia(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'downloadMedia') {
    downloadMedia(request.url, request.format, request.quality)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'openInNewTab') {
    chrome.tabs.create({ url: request.url });
    sendResponse({ success: true });
  }
});

// API Functions
async function analyzeMedia(url) {
  console.log('SMD: Analyzing URL:', url);
  
  try {
    const response = await fetch(`${API_BASE_URL}/media/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    console.log('SMD: API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMD: API Error Response:', errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('SMD: Analysis Success:', data);
    return data;
  } catch (error) {
    console.error('SMD: Analysis Failed:', error);
    throw error;
  }
}

async function downloadMedia(url, format, quality) {
  const analyzeResponse = await fetch(`${API_BASE_URL}/media/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  });
  
  if (!analyzeResponse.ok) {
    throw new Error('Failed to analyze media');
  }
  
  const metadata = await analyzeResponse.json();
  
  const downloadResponse = await fetch(`${API_BASE_URL}/media/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      platform: metadata.platform,
      format,
      quality
    })
  });
  
  if (!downloadResponse.ok) {
    throw new Error('Failed to start download');
  }
  
  const downloadData = await downloadResponse.json();
  
  // Poll for download completion
  return await pollDownloadStatus(downloadData.downloadId);
}

async function pollDownloadStatus(downloadId) {
  const maxAttempts = 60; // 60 seconds max
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = await fetch(`${API_BASE_URL}/downloads/${downloadId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check download status');
    }
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      return {
        downloadId,
        fileUrl: `${API_BASE_URL}/downloads/${downloadId}/file`,
        fileName: data.title || 'download'
      };
    }
    
    if (data.status === 'failed') {
      throw new Error(data.error || 'Download failed');
    }
    
    // Wait 1 second before next poll
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error('Download timeout');
}
