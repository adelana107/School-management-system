        document.addEventListener('DOMContentLoaded', function() {
            // Initialize tooltips
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Update online status
            function updateOnlineStatus() {
                fetch('/api/online-status/')
                    .then(response => response.json())
                    .then(data => {
                        const statusIndicator = document.querySelector('.online-status');
                        if (data.is_online) {
                            statusIndicator.classList.add('bg-success');
                            statusIndicator.classList.remove('bg-secondary');
                        } else {
                            statusIndicator.classList.add('bg-secondary');
                            statusIndicator.classList.remove('bg-success');
                        }
                    });
            }

            updateOnlineStatus();
            setInterval(updateOnlineStatus, 30000);
        });