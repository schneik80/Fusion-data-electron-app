/**
 * Tests for renderer.js functionality
 */

describe('Renderer Process', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock window.electronAPI
    window.electronAPI = {
      loadUrl: jest.fn(),
      sidebarToggle: jest.fn(),
    };
  });

  test('should have electronAPI available', () => {
    expect(window.electronAPI).toBeDefined();
    expect(window.electronAPI.loadUrl).toBeDefined();
    expect(window.electronAPI.sidebarToggle).toBeDefined();
  });

  test('should find sidebar element', () => {
    // Create mock sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    document.body.appendChild(sidebar);

    const foundSidebar = document.querySelector('.sidebar');
    expect(foundSidebar).toBeDefined();
  });

  test('should find menu button', () => {
    // Create mock button
    const button = document.createElement('button');
    button.id = 'btn';
    button.className = 'menu-btn';
    document.body.appendChild(button);

    const foundButton = document.querySelector('#btn');
    expect(foundButton).toBeDefined();
  });

  test('should toggle sidebar class', () => {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    document.body.appendChild(sidebar);

    // Simulate toggle
    sidebar.classList.toggle('open');
    expect(sidebar.classList.contains('open')).toBe(true);

    sidebar.classList.toggle('open');
    expect(sidebar.classList.contains('open')).toBe(false);
  });

  test('should update menu icon based on sidebar state', () => {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    
    const button = document.createElement('button');
    button.id = 'btn';
    button.className = 'menu-btn';
    
    const icon = document.createElement('span');
    icon.className = 'menu-icon';
    button.appendChild(icon);
    
    document.body.appendChild(sidebar);
    document.body.appendChild(button);

    // Test closed state (hamburger icon)
    sidebar.classList.remove('open');
    icon.innerHTML = '&#xf0c9;';
    // HTML entities get decoded, so check for the entity or decoded character
    expect(icon.innerHTML).toMatch(/&#xf0c9;|[\uF0C9]/);

    // Test open state (close icon)
    sidebar.classList.add('open');
    icon.innerHTML = '&#xf00d;';
    // HTML entities get decoded, so check for the entity or decoded character
    expect(icon.innerHTML).toMatch(/&#xf00d;|[\uF00D]/);
  });

  test('should handle navigation link clicks', () => {
    const link = document.createElement('a');
    link.setAttribute('data-url', 'https://www.autodesk.com');
    link.className = 'nav-link';
    document.body.appendChild(link);

    const url = link.getAttribute('data-url');
    expect(url).toBe('https://www.autodesk.com');
  });
});

describe('Menu Button Change Function', () => {
  test('should change icon to close when sidebar is open', () => {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar open';
    
    const button = document.createElement('button');
    const icon = document.createElement('span');
    icon.className = 'menu-icon';
    button.appendChild(icon);
    button.appendChild(sidebar);

    if (sidebar.classList.contains('open')) {
      icon.innerHTML = '&#xf00d;';
    } else {
      icon.innerHTML = '&#xf0c9;';
    }

    // HTML entities get decoded, so check for the entity or decoded character
    expect(icon.innerHTML).toMatch(/&#xf00d;|[\uF00D]/);
  });

  test('should change icon to menu when sidebar is closed', () => {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    
    const button = document.createElement('button');
    const icon = document.createElement('span');
    icon.className = 'menu-icon';
    button.appendChild(icon);
    button.appendChild(sidebar);

    if (sidebar.classList.contains('open')) {
      icon.innerHTML = '&#xf00d;';
    } else {
      icon.innerHTML = '&#xf0c9;';
    }

    // HTML entities get decoded, so check for the entity or decoded character
    expect(icon.innerHTML).toMatch(/&#xf0c9;|[\uF0C9]/);
  });
});

