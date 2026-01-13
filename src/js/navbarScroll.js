// Script to add box shadow to navbar when scrolled
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar');
  
  if (navbar) {
    // Check initial scroll position
    if (window.scrollY > 0) {
      navbar.classList.add('navbar-scrolled');
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', function() {
      if (window.scrollY > 0) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    });
    
    // Subtle enhancement for mobile menu - watch for it to open
    const observeMobileMenu = () => {
      // Use a MutationObserver to detect when the mobile menu is added to the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
              // Check if the added node is the navbar sidebar
              if (node.classList && node.classList.contains('navbar-sidebar')) {
                // Add z-index override class to ensure it's visible
                node.classList.add('mobile-menu-visible');
              }
            });
          }
        });
      });
      
      // Start observing the body for added nodes
      observer.observe(document.body, { childList: true });
    };
    
    observeMobileMenu();
  }
});

// Mobile responsive adjustments
document.addEventListener('DOMContentLoaded', function() {
  // Function to handle responsive adjustments
  function handleResponsiveLayout() {
    const isMobile = window.innerWidth < 576;
    const isTablet = window.innerWidth >= 576 && window.innerWidth < 996;
    
    // Adjust hero section for mobile devices
    const heroSection = document.querySelector('.hero--primary');
    if (heroSection) {
      if (isMobile) {
        heroSection.style.minHeight = 'auto';
        heroSection.style.paddingTop = '3rem';
        heroSection.style.paddingBottom = '3rem';
      } else if (isTablet) {
        heroSection.style.minHeight = 'auto';
        heroSection.style.paddingTop = '4rem';
        heroSection.style.paddingBottom = '4rem';
      } else {
        heroSection.style.minHeight = '80vh';
        heroSection.style.paddingTop = '6rem';
        heroSection.style.paddingBottom = '6rem';
      }
    }
    
    // Fix code container width for mobile
    const codeContainer = document.querySelector('.codeContainer');
    if (codeContainer && isMobile) {
      codeContainer.style.width = '100%';
      codeContainer.style.maxWidth = 'calc(100vw - 2rem)';
    }
  }
  
  // Run on load
  handleResponsiveLayout();
  
  // Run on resize
  window.addEventListener('resize', handleResponsiveLayout);
});
