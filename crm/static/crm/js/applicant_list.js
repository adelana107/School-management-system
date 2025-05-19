$(document).ready(function() {
            // Search functionality
            $("#searchInput").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                var statusFilter = $("#statusFilter").val();
                
                $(".application-row").each(function() {
                    var rowText = $(this).text().toLowerCase();
                    var rowStatus = $(this).data("status");
                    var statusMatch = (statusFilter === "all") || (rowStatus === statusFilter);
                    
                    $(this).toggle(
                        rowText.indexOf(value) > -1 && statusMatch
                    );
                });
            });

            // Status filter functionality
            $("#statusFilter").change(function() {
                var statusFilter = $(this).val();
                var searchValue = $("#searchInput").val().toLowerCase();
                
                $(".application-row").each(function() {
                    var rowText = $(this).text().toLowerCase();
                    var rowStatus = $(this).data("status");
                    var textMatch = rowText.indexOf(searchValue) > -1 || searchValue === "";
                    var statusMatch = (statusFilter === "all") || (rowStatus === statusFilter);
                    
                    $(this).toggle(
                        textMatch && statusMatch
                    );
                });
            });

            // Auto-expand accordion if search is active
            $("#searchInput").on("keyup", function() {
                if ($(this).val().length > 0) {
                    $(".accordion-collapse").addClass("show");
                }
            });

            // Remember accordion state
            $('.accordion-button').click(function() {
                var target = $(this).attr('data-bs-target');
                var isCollapsed = $(target).hasClass('show');
                
                if (!isCollapsed) {
                    localStorage.setItem(target, 'expanded');
                } else {
                    localStorage.removeItem(target);
                }
            });

            // Restore accordion state on page load
            $('.accordion-collapse').each(function() {
                var id = '#' + $(this).attr('id');
                if (localStorage.getItem(id) === 'expanded') {
                    $(this).addClass('show');
                }
            });
        });