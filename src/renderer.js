import './index.css';

let sidebar = null;
let closeBtn = null;
let navLinks = null;

// Try multiple times in case preload loads after DOMContentLoaded
function trySetup() {
  console.log('Attempting to set up sidebar...');
  console.log('window.electronAPI:', window.electronAPI);
  console.log('window.electronAPI?.loadUrl:', window.electronAPI?.loadUrl);
  
  if (!window.electronAPI?.loadUrl) {
    console.warn('electronAPI not available yet, retrying...');
    setTimeout(trySetup, 100);
    return;
  }

  // Get sidebar elements
  sidebar = document.querySelector(".sidebar");
  closeBtn = document.querySelector("#btn");
  navLinks = document.querySelectorAll(".nav-list a[data-url]");

  if (!sidebar) {
    console.error('Sidebar not found');
    setTimeout(trySetup, 100);
    return;
  }

  if (!closeBtn) {
    console.error('Close button not found');
    setTimeout(trySetup, 100);
    return;
  }

  console.log('Sidebar elements found');
  console.log('Found', navLinks.length, 'navigation links');

  // Setup sidebar toggle - remove any existing listeners
  closeBtn.replaceWith(closeBtn.cloneNode(true));
  closeBtn = document.querySelector("#btn");
  
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle button clicked');
    sidebar.classList.toggle("open");
    const isOpen = sidebar.classList.contains("open");
    console.log('Sidebar is now:', isOpen ? 'open' : 'closed');
    menuBtnChange();
    
    // Notify main process about sidebar state change
    if (window.electronAPI?.sidebarToggle) {
      window.electronAPI.sidebarToggle(isOpen);
    }
  });

  // Setup navigation links
  navLinks.forEach((link, index) => {
    const url = link.dataset.url;
    console.log(`Link ${index}:`, url);
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Link clicked:', url);
      
      if (url) {
        console.log('Calling electronAPI.loadUrl:', url);
        window.electronAPI.loadUrl(url);
        
        // Visual feedback - remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      } else {
        console.error('No URL found in link');
      }
    });
  });

  // Initialize menu button state
  menuBtnChange();

  // Load default URL (Projects)
  const defaultUrl = 'https://imallc.autodesk360.com/g/all_projects/active';
  window.electronAPI.loadUrl(defaultUrl);
  
  // Set default active link
  const defaultLink = Array.from(navLinks).find(link => link.dataset.url === defaultUrl);
  if (defaultLink) {
    defaultLink.classList.add('active');
  }

  console.log('✅ Sidebar setup complete');
}

function menuBtnChange() {
  if (!closeBtn || !sidebar) return;
  
  const menuIcon = closeBtn.querySelector('.menu-icon');
  if (!menuIcon) return;
  
  if (sidebar.classList.contains("open")) {
    // Change to close icon (X) - using nerdfont
    menuIcon.innerHTML = '&#xf00d;';
  } else {
    // Change to menu icon (hamburger) - using nerdfont f0c9
    menuIcon.innerHTML = '&#xf0c9;';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded: Starting setup');
  trySetup();
});

// Also try immediately in case DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', trySetup);
} else {
  trySetup();
}
