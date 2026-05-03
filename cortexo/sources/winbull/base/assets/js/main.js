document.addEventListener('DOMContentLoaded', function () {
    // Select all elements with the 'animate' class
    var elements = document.querySelectorAll('.animate');

    // Create an intersection observer
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            // When the element comes into view
            if (entry.isIntersecting) {
                // Add the 'is-visible' class to trigger the CSS animation
                entry.target.classList.add('is-visible');
                // Optional: stop observing once it has animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Triggers when 10% of the element is visible
    });

    // Observe each element
    elements.forEach(function (element) {
        observer.observe(element);
    });
});

/* Mobile Sidebar Menu Script */
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('mobileMenuToggle');
    var sidebar = document.getElementById('mobileSidebar');
    var overlay = document.getElementById('mobileOverlay');
    var closeBtn = document.getElementById('sidebarClose');

    function openMenu() {
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        if (toggle) toggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (toggle) toggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
});
