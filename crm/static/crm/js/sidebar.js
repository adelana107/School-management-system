// Toggle sidebar collapse
        document.getElementById('sidebarToggle').addEventListener('click', function() {
            document.querySelector('.sidebar-container').classList.toggle('collapsed');
        });

        // Toggle submenus
        document.querySelectorAll('.menu-item.has-submenu > .menu-link').forEach(item => {
            item.addEventListener('click', function(e) {
                if (window.innerWidth > 768 || document.querySelector('.sidebar-container').classList.contains('collapsed')) {
                    e.preventDefault();
                    const submenu = this.nextElementSibling;
                    this.parentElement.classList.toggle('open');
                    submenu.style.maxHeight = submenu.style.maxHeight ? null : submenu.scrollHeight + 'px';
                }
            });
        });

        // Dark mode toggle
        function toggleDarkMode() {
            const body = document.body;
            const icon = document.getElementById("darkModeIcon");
            const text = document.getElementById("darkModeText");
            const switchInput = document.getElementById("darkModeSwitch");

            // Toggle dark mode
            body.classList.toggle("dark-mode");
            const isDarkMode = body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
            switchInput.checked = isDarkMode;

            // Update icon and text
            if (isDarkMode) {
                text.innerText = "Light Mode";
                icon.classList.replace("fa-moon", "fa-sun");
            } else {
                text.innerText = "Dark Mode";
                icon.classList.replace("fa-sun", "fa-moon");
            }
        }

        // Apply saved dark mode preference
        document.addEventListener("DOMContentLoaded", function() {
            const body = document.body;
            const icon = document.getElementById("darkModeIcon");
            const text = document.getElementById("darkModeText");
            const switchInput = document.getElementById("darkModeSwitch");

            if (localStorage.getItem("darkMode") === "enabled") {
                body.classList.add("dark-mode");
                text.innerText = "Light Mode";
                icon.classList.replace("fa-moon", "fa-sun");
                switchInput.checked = true;
            }

            // Initialize submenu heights
            document.querySelectorAll('.menu-item.has-submenu.open > .submenu').forEach(submenu => {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            });

            // 20-20-20 eye care reminder
            setInterval(() => {
                if (!document.hidden && Notification.permission === "granted") {
                    const notification = new Notification("Eye Care Reminder", {
                        body: "👀 Look 20 feet away for 20 seconds",
                        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234cc9f0'%3E%3Cpath d='M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z'/%3E%3C/svg%3E",
                        silent: true
                    });
                    setTimeout(() => notification.close(), 10000);
                }
            }, 20 * 60 * 1000);

            // Request notification permission
            if (Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        });