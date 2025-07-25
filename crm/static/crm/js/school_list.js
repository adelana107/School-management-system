$(document).ready(function() {
            // Search functionality
            $("#searchInput").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $(".school-card").each(function() {
                    var cardText = $(this).text().toLowerCase();
                    $(this).toggle(cardText.indexOf(value) > -1);
                });
            });

            // Tooltips
            $('[data-bs-toggle="tooltip"]').tooltip();
        });


const statusFilter = document.getElementById('statusFilter');
if (statusFilter) {
    statusFilter.addEventListener('change', function () {
        if (filterForm) {
            filterForm.submit();
        }
    });
}



