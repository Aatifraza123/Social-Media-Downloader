// Instagram content script - Inject download buttons

console.log('Social Media Downloader: Instagram script loaded');

let currentUrl = window.location.href;
let observer = null;

// Initialize
init();

function init() {
  // Initial injection
  setTimeout(() => {
    injectButtons();
  }, 2000);
  
  // Watch for URL changes (Instagram is SPA)
  watchUrlChanges();
  
  // Watch for new posts loaded
  observeNewPosts();
}

function watchUrlChanges() {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      currentUrl = url;
      setTimeout(() => {
        injectButtons();
      }, 1500);
    }
  }).observe(document.querySelector('body'), { subtree: true, childList: true });
}

function observeNewPosts() {
  observer = new MutationObserver((mutations) => {
    // Check if new posts are added to feed
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        setTimeout(() => {
          injectButtons();
        }, 500);
        break;
      }
    }
  });
  
  const feedContainer = document.querySelector('main');
  if (feedContainer) {
    observer.observe(feedContainer, { childList: true, subtree: true });
  }
}

function injectButtons() {
  // For post/reel pages
  if (window.location.pathname.match(/\/(p|reel|tv)\/([^\/]+)/)) {
    injectSinglePostButton();
  }
  
  // For feed posts
  injectFeedButtons();
}

function injectSinglePostButton() {
  // Find the action bar (like, comment, share buttons)
  const actionBars = document.querySelectorAll('section[class*="x"]');
  
  for (const actionBar of actionBars) {
    // Skip if already has download button
    if (actionBar.querySelector('.smd-download-btn')) continue;
    
    // Check if this is an action bar with buttons
    const buttons = actionBar.querySelectorAll('button, a');
    if (buttons.length < 2) continue;
    
    const downloadBtn = createDownloadButton();
    
    // Insert after the first few buttons
    const targetButton = buttons[1] || buttons[0];
    if (targetButton && targetButton.parentElement) {
      targetButton.parentElement.style.display = 'flex';
      targetButton.parentElement.style.gap = '8px';
      targetButton.parentElement.appendChild(downloadBtn);
    }
  }
}

function injectFeedButtons() {
  // Find all article elements (posts in feed)
  const posts = document.querySelectorAll('article');
  
  posts.forEach(post => {
    // Skip if already has download button
    if (post.querySelector('.smd-download-btn')) return;
    
    // Find action bar in this post
    const actionBar = post.querySelector('section');
    if (!actionBar) return;
    
    const buttons = actionBar.querySelectorAll('button, a');
    if (buttons.length < 2) return;
    
    // Get post URL from the post
    const postLink = post.querySelector('a[href*="/p/"], a[href*="/reel/"], a[href*="/tv/"]');
    if (!postLink) return;
    
    const postUrl = postLink.href;
    
    const downloadBtn = createDownloadButton(postUrl);
    
    // Insert after share button
    const targetButton = buttons[2] || buttons[1] || buttons[0];
    if (targetButton && targetButton.parentElement) {
      targetButton.parentElement.style.display = 'flex';
      targetButton.parentElement.style.gap = '8px';
      targetButton.parentElement.appendChild(downloadBtn);
    }
  });
}

function createDownloadButton(postUrl = null) {
  const btn = document.createElement('button');
  btn.className = 'smd-download-btn';
  btn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `;
  btn.title = 'Download with Social Media Downloader';
  
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = postUrl || window.location.href;
    showDownloadModal(url, btn);
  });
  
  return btn;
}

async function showDownloadModal(url, buttonElement) {
  // Show loading state
  buttonElement.disabled = true;
  buttonElement.innerHTML = `
    <svg class="smd-spinner" width="24" height="24" viewBox="0 0 24 24">
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
    createDownloadOptionsModal(url, metadata, buttonElement);
    
  } catch (error) {
    alert('Failed to analyze media: ' + error.message);
    resetButton(buttonElement);
  }
}

function createDownloadOptionsModal(url, metadata, buttonElement) {
  // Remove existing modal
  const existingModal = document.querySelector('.smd-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'smd-modal';
  modal.innerHTML = `
    <div class="smd-modal-content">
      <div class="smd-modal-header">
        <h3>Download Options</h3>
        <button class="smd-close">&times;</button>
      </div>
      <div class="smd-modal-body">
        <div class="smd-preview">
          ${metadata.thumbnail ? `<img src="${metadata.thumbnail}" alt="Preview">` : ''}
          <div class="smd-info">
            <p class="smd-title">${metadata.title || 'Untitled'}</p>
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
    resetButton(buttonElement);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      resetButton(buttonElement);
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

function resetButton(buttonElement) {
  buttonElement.disabled = false;
  buttonElement.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `;
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
