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
  // Multiple selectors to find action bar (Instagram keeps changing structure)
  const selectors = [
    'section > div > span', // New structure
    'section[class*="x"] > div', // Alternative
    'article section span', // Fallback
  ];
  
  let actionContainer = null;
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      // Check if this element contains action buttons (like, comment, share)
      const svgs = el.querySelectorAll('svg');
      if (svgs.length >= 2) {
        actionContainer = el;
        break;
      }
    }
    if (actionContainer) break;
  }
  
  if (!actionContainer) {
    console.log('SMD: Action container not found');
    return;
  }
  
  // Skip if already has download button
  if (actionContainer.querySelector('.smd-download-btn')) return;
  
  const downloadBtn = createDownloadButton();
  
  // Create wrapper to match Instagram's button style
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display: inline-flex; align-items: center;';
  wrapper.appendChild(downloadBtn);
  
  // Append at the end
  actionContainer.appendChild(wrapper);
  
  console.log('SMD: Download button injected on single post');
}

function injectFeedButtons() {
  // Find all article elements (posts in feed)
  const posts = document.querySelectorAll('article');
  
  posts.forEach(post => {
    // Skip if already has download button
    if (post.querySelector('.smd-download-btn')) return;
    
    // Get post URL from the post
    const postLink = post.querySelector('a[href*="/p/"], a[href*="/reel/"], a[href*="/tv/"]');
    if (!postLink) return;
    
    const postUrl = postLink.href;
    
    // Find action bar using multiple strategies
    const actionBar = post.querySelector('section');
    if (!actionBar) return;
    
    // Find the container with action buttons
    let actionContainer = null;
    const spans = actionBar.querySelectorAll('span');
    
    for (const span of spans) {
      const svgs = span.querySelectorAll('svg');
      if (svgs.length >= 2) {
        actionContainer = span;
        break;
      }
    }
    
    if (!actionContainer) {
      // Fallback: try to find div with buttons
      const divs = actionBar.querySelectorAll('div');
      for (const div of divs) {
        const svgs = div.querySelectorAll('svg');
        if (svgs.length >= 2) {
          actionContainer = div;
          break;
        }
      }
    }
    
    if (!actionContainer) return;
    
    const downloadBtn = createDownloadButton(postUrl);
    
    // Create wrapper to match Instagram's button style
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-flex; align-items: center;';
    wrapper.appendChild(downloadBtn);
    
    // Append at the end
    actionContainer.appendChild(wrapper);
  });
  
  console.log('SMD: Processed ' + posts.length + ' posts in feed');
}

function createDownloadButton(postUrl = null) {
  const btn = document.createElement('div');
  btn.className = 'smd-download-btn';
  btn.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 8px;
  `;
  btn.innerHTML = `
    <svg aria-label="Download" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a1 1 0 0 1 1 1v10.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1zM3 17a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a1 1 0 1 1 2 0v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-2a1 1 0 0 1 1-1z"/>
    </svg>
  `;
  btn.title = 'Download with Social Media Downloader';
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = postUrl || window.location.href;
    console.log('SMD: Download button clicked for:', url);
    showDownloadModal(url, btn);
  });
  
  // Hover effect
  btn.addEventListener('mouseenter', () => {
    btn.style.opacity = '0.6';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.opacity = '1';
  });
  
  return btn;
}

async function showDownloadModal(url, buttonElement) {
  console.log('SMD: showDownloadModal called for:', url);
  
  // Clean the URL - remove query parameters and tracking codes
  let cleanUrl = url;
  try {
    const urlObj = new URL(url);
    // Remove query parameters for Instagram
    if (urlObj.hostname.includes('instagram.com')) {
      cleanUrl = urlObj.origin + urlObj.pathname;
    }
    console.log('SMD: Cleaned URL:', cleanUrl);
  } catch (e) {
    console.error('SMD: URL parsing error:', e);
  }
  
  // Show loading state
  buttonElement.disabled = true;
  const originalHTML = buttonElement.innerHTML;
  buttonElement.innerHTML = `
    <svg class="smd-spinner" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none"></path>
    </svg>
  `;
  
  try {
    console.log('SMD: Sending message to background script...');
    
    // Analyze media
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeMedia',
      url: cleanUrl
    });
    
    console.log('SMD: Response from background:', response);
    
    if (!response.success) {
      throw new Error(response.error || 'Unknown error');
    }
    
    const metadata = response.data;
    
    // Create modal
    createDownloadOptionsModal(cleanUrl, metadata, buttonElement, originalHTML);
    
  } catch (error) {
    console.error('SMD: Error in showDownloadModal:', error);
    alert('Failed to analyze media: ' + error.message + '\n\nCheck console for details (F12)');
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
