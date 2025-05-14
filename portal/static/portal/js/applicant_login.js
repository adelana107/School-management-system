function toggleDarkMode() {
            document.body.classList.toggle("dark-mode");
            const icon = document.querySelector('.dark-mode-toggle i');
            if (document.body.classList.contains("dark-mode")) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
            
            // Save preference to localStorage
            const isDarkMode = document.body.classList.contains("dark-mode");
            localStorage.setItem('darkMode', isDarkMode);
        }
        
        // Check for saved dark mode preference
        document.addEventListener('DOMContentLoaded', function() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            if (darkMode) {
                document.body.classList.add("dark-mode");
                const icon = document.querySelector('.dark-mode-toggle i');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });