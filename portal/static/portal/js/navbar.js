// Initialize Bootstrap components when DOM is loaded
        document.addEventListener("DOMContentLoaded", function() {
            // Initialize dropdowns
            const dropdowns = document.querySelectorAll('.dropdown-toggle');
            dropdowns.forEach(dropdown => {
                dropdown.addEventListener('click', function(e) {
                    e.preventDefault();
                    const dropdownMenu = this.nextElementSibling;
                    dropdownMenu.classList.toggle('show');
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.matches('.dropdown-toggle') && !e.target.closest('.dropdown-menu')) {
                    const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
                    openDropdowns.forEach(dropdown => {
                        dropdown.classList.remove('show');
                    });
                }
            });

            // Theme management
            function initTheme() {
                const darkModeEnabled = localStorage.getItem("dark-mode") === "enabled" || 
                    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem("dark-mode"));
                
                if (darkModeEnabled) {
                    enableDarkMode();
                }
            }

            function enableDarkMode() {
                document.body.classList.add("dark-mode");
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                document.getElementById("darkModeText").innerText = "Light Mode";
                document.getElementById("darkModeIcon").className = "fas fa-sun me-2";
                localStorage.setItem("dark-mode", "enabled");
            }

            function disableDarkMode() {
                document.body.classList.remove("dark-mode");
                document.documentElement.setAttribute('data-bs-theme', 'light');
                document.getElementById("darkModeText").innerText = "Dark Mode";
                document.getElementById("darkModeIcon").className = "fas fa-moon me-2";
                localStorage.setItem("dark-mode", "disabled");
            }

            window.toggleDarkMode = function() {
                if (document.body.classList.contains("dark-mode")) {
                    disableDarkMode();
                } else {
                    enableDarkMode();
                }
            }

            // Initialize theme
            initTheme();

            // Profile picture fallback
            document.querySelectorAll('img[onerror]').forEach(img => {
                img.onerror = function() {
                    this.src = '{% static "images/default-profile.png" %}';
                };
            });
        });

        // Listen for system color scheme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem("dark-mode")) {
                if (e.matches) {
                    enableDarkMode();
                } else {
                    disableDarkMode();
                }
            }
        });