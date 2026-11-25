// YouTube content script - Inject download button

console.log('Social Media Downloader: YouTube script loaded');

// Initialize
init();

function init() {
  // Wait for YouTube to load
  waitForElement('#movie_player').then(() => {
    injectButton();
  });
  
  // Watch for navigation (YouTube is SPA)
  watchNavigation();
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Element not found: ' + selector));
    }, timeout);
  });
}

function watchNavigation() {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (url.includes('/watch')) {
        setTimeout(() => {
          injectButton();
        }, 1000);
      }
    }
  }).observe(document.querySelector('body'), { subtree: true, childList: true });
}

function injectButton() {
  // Check if we're on a video page
  if (!window.location.pathname.includes('/watch')) return;
  
  // Find the actions bar (like, dislike, share buttons)
  waitForElement('#actions ytd-menu-renderer').then(actionsContainer => {
    // Skip if already injected
    if (document.querySelector('.smd-yt-download-btn')) return;
    
    // Find the flex container with buttons
    const topLevelButtons = actionsContainer.querySelector('#top-level-buttons-computed');
    if (!topLevelButtons) return;
    
    const downloadBtn = createYouTubeDownloadButton();
    topLevelButtons.appendChild(downloadBtn);
  });
}

function createYouTubeDownloadButton() {
  const btn = document.createElement('button');
  btn.className = 'smd-yt-download-btn smd-download-btn';
  btn.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    height: 36px;
    background: transparent;
    border: none;
    border-radius: 18px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--yt-spec-text-primary);
    transition: background 0.2s;
  `;
  
  btn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span>Download</span>
  `;
  
  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'var(--yt-spec-badge-chip-background)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'transparent';
  });
  
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = window.location.href;
    showDownloadModal(url, btn);
  });
  
  return btn;
}

async function showDownloadModal(url, buttonElement) {
  // Show loading state
  const originalHTML = buttonElement.innerHTML;
  buttonElement.disabled = true;
  buttonElement.querySelector('span').textContent = 'Loading...';
  
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
    alert('Failed to analyze video: ' + error.message);
    buttonElement.disabled = false;
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
        <h3>Download YouTube Video</h3>
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
    buttonElement.disabled = false;
    buttonElement.innerHTML = originalHTML;
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      buttonElement.disabled = false;
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
