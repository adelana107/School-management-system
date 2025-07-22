$(document).ready(function() {
            // Initialize date inputs
            flatpickr('input[type="date"]', {
                dateFormat: "Y-m-d",
                allowInput: true,
                maxDate: "{{ now|date:'Y-m-d' }}"
            });

            // Layout adjustment
            function adjustLayout() {
                const sidebar = $('.crm-sidebar');
                const main = $('.crm-main');
                
                if ($(window).width() > 992) {
                    const sidebarWidth = sidebar.outerWidth();
                    main.css('margin-left', sidebarWidth + 'px');
                } else {
                    main.css('margin-left', '0');
                }
            }

            // Initial adjustment
            adjustLayout();
            
            // Adjust on window resize with debounce
            let resizeTimer;
            $(window).resize(function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(adjustLayout, 250);
            });

            // Confirm before delete
            $('a[href*="delete_application"]').on('click', function(e) {
                if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
                    e.preventDefault();
                }
            });

            // Toggle advanced filters
            $('#advancedFilters').on('show.bs.collapse', function() {
                $('[data-bs-target="#advancedFilters"]').html('<i class="fas fa-sliders-h me-1"></i> Fewer Filters');
            }).on('hide.bs.collapse', function() {
                $('[data-bs-target="#advancedFilters"]').html('<i class="fas fa-sliders-h me-1"></i> More Filters');
            });
        });