document.addEventListener('DOMContentLoaded', function() {
            // Sidebar toggle functionality for mobile
            const sidebarToggle = document.getElementById('sidebarToggle');
            const mainContent = document.getElementById('mainContent');
            
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    document.body.classList.toggle('sidebar-show');
                });
            }
            
            // Close sidebar when clicking on main content in mobile view
            if (mainContent) {
                mainContent.addEventListener('click', function() {
                    if (window.innerWidth < 992 && document.body.classList.contains('sidebar-show')) {
                        document.body.classList.remove('sidebar-show');
                    }
                });
            }
            
            // Initialize tooltips
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
            
            // Filter form handling
            const filterForm = document.getElementById('filterForm');
            const filterButton = document.getElementById('filterButton');
            const schoolFilter = document.getElementById('schoolFilter');
            
            if (filterForm) {
                filterForm.addEventListener('submit', function() {
                    // Show loading state
                    filterButton.classList.add('btn-loading');
                    filterButton.disabled = true;
                });
            }
            
            // School filter change handler
            if (schoolFilter) {
                schoolFilter.addEventListener('change', function() {
                    if (filterForm) {
                        filterForm.submit();
                    }
                });
            }
            
            // Reset loading state when page finishes loading
            window.addEventListener('load', function() {
                if (filterButton) {
                    filterButton.classList.remove('btn-loading');
                    filterButton.disabled = false;
                }
            });
        });


const sessionFilter = document.getElementById('sessionFilter');
if (sessionFilter) {
    sessionFilter.addEventListener('change', function () {
        if (filterForm) {
            filterForm.submit();
        }
    });
}
