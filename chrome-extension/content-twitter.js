// Twitter/X content script - Inject download button

console.log('Social Media Downloader: Twitter/X script loaded');

// Initialize
init();

function init() {
  // Initial injection after page load
  setTimeout(() => {
    injectButtons();
  }, 2000);
  
  // Watch for new tweets
  observeNewTweets();
  
  // Watch for navigation
  watchNavigation();
}

function watchNavigation() {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => {
        injectButtons();
      }, 1500);
    }
  }).observe(document.querySelector('body'), { subtree: true, childList: true });
}

function observeNewTweets() {
  const observer = new MutationObserver(() => {
    injectButtons();
  });
  
  const timeline = document.querySelector('[data-testid="primaryColumn"]');
  if (timeline) {
    observer.observe(timeline, { childList: true, subtree: true });
  }
}

function injectButtons() {
  // Find all tweet articles
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  
  tweets.forEach(tweet => {
    // Skip if already has download button
    if (tweet.querySelector('.smd-twitter-download-btn')) return;
    
    // Check if tweet has video
    const hasVideo = tweet.querySelector('video, [data-testid="videoPlayer"]');
    if (!hasVideo) return;
    
    // Find the actions bar (reply, retweet, like, share buttons)
    const actionsBar = tweet.querySelector('[role="group"]');
    if (!actionsBar) return;
    
    // Get tweet URL
    const tweetLink = tweet.querySelector('a[href*="/status/"]');
    if (!tweetLink) return;
    
    const tweetUrl = 'https://twitter.com' + tweetLink.getAttribute('href');
    
    // Create and inject download button
    const downloadBtn = createTwitterDownloadButton(tweetUrl);
    actionsBar.appendChild(downloadBtn);
  });
}

function createTwitterDownloadButton(tweetUrl) {
  const btn = document.createElement('div');
  btn.className = 'smd-twitter-download-btn';
  btn.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    cursor: pointer;
    border-radius: 9999px;
    transition: background-color 0.2s;
  `;
  
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `;
  
  btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = 'transparent';
  });
  
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    showDownloadModal(tweetUrl, btn);
  });
  
  return btn;
}

async function showDownloadModal(url, buttonElement) {
  // Show loading state
  const originalHTML = buttonElement.innerHTML;
  buttonElement.innerHTML = `
    <svg class="smd-spinner" width="18" height="18" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none"></path>
    </svg>
  `;
  
  try {
    // Analyze media
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeMedia',
      url: url
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    const metadata = response.data;
    
    // Create modal
    createDownloadOptionsModal(url, metadata, buttonElement, originalHTML);
    
  } catch (error) {
    alert('Failed to analyze tweet: ' + error.message);
    buttonElement.innerHTML = originalHTML;
  }
}

function createDownloadOptionsModal(url, metadata, buttonElement, originalHTML) {
  // Remove existing modal
  const existingModal = document.querySelector('.smd-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'smd-modal';
  modal.innerHTML = `
    <div class="smd-modal-content">
      <div class="smd-modal-header">
        <h3>Download Twitter Video</h3>
        <button class="smd-close">&times;</button>
      </div>
      <div class="smd-modal-body">
        <div class="smd-preview">
          ${metadata.thumbnail ? `<img src="${metadata.thumbnail}" alt="Preview">` : ''}
          <div class="smd-info">
            <p class="smd-title">${metadata.title || 'Twitter Video'}</p>
            ${metadata.creator ? `<p class="smd-creator">by ${metadata.creator}</p>` : ''}
            ${metadata.duration ? `<p class="smd-duration">${metadata.duration}</p>` : ''}
          </div>
        </div>
        <div class="smd-formats">
          ${metadata.availableFormats.map(format => `
            <button class="smd-format-btn" data-format="${format.format}" data-quality="${format.quality}">
              <div class="smd-format-label">${format.label}</div>
              ${format.fileSize ? `<div class="smd-format-size">${formatFileSize(format.fileSize)}</div>` : ''}
            </button>
          `).join('')}
        </div>
        <div class="smd-status"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  modal.querySelector('.smd-close').addEventListener('click', () => {
    modal.remove();
    buttonElement.innerHTML = originalHTML;
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      buttonElement.innerHTML = originalHTML;
    }
  });
  
  // Format button clicks
  modal.querySelectorAll('.smd-format-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const format = btn.dataset.format;
      const quality = btn.dataset.quality;
      
      await startDownload(url, format, quality, modal);
    });
  });
}

async function startDownload(url, format, quality, modal) {
  const statusDiv = modal.querySelector('.smd-status');
  statusDiv.innerHTML = '<p class="smd-loading">Starting download...</p>';
  
  // Disable all format buttons
  modal.querySelectorAll('.smd-format-btn').forEach(btn => btn.disabled = true);
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'downloadMedia',
      url: url,
      format: format,
      quality: quality
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    statusDiv.innerHTML = '<p class="smd-success">✓ Download ready!</p>';
    
    // Trigger file download
    const downloadUrl = response.data.fileUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = response.data.fileName;
    link.click();
    
    // Close modal after delay
    setTimeout(() => {
      modal.remove();
    }, 2000);
    
  } catch (error) {
    statusDiv.innerHTML = `<p class="smd-error">❌ ${error.message}</p>`;
    modal.querySelectorAll('.smd-format-btn').forEach(btn => btn.disabled = false);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showDownloadUI') {
    showDownloadModal(request.url, document.body);
    sendResponse({ success: true });
  }
});
