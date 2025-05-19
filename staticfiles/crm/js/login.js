function toggleDarkMode() {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", isDark);
            const icon = document.querySelector('.dark-mode-toggle i');
            icon.classList.toggle("fa-moon", !isDark);
            icon.classList.toggle("fa-sun", isDark);
        }

        document.addEventListener("DOMContentLoaded", () => {
            if (localStorage.getItem("darkMode") === "true") {
                document.body.classList.add("dark-mode");
                const icon = document.querySelector('.dark-mode-toggle i');
                icon.classList.add("fa-sun");
                icon.classList.remove("fa-moon");
            }
        });

        function togglePasswordVisibility() {
            const passwordInput = document.getElementById('password');
            const passwordIcon = document.getElementById('password-icon');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordIcon.classList.remove('fa-eye-slash');
                passwordIcon.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                passwordIcon.classList.remove('fa-eye');
                passwordIcon.classList.add('fa-eye-slash');
            }
        }