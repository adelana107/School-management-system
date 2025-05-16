 $(document).ready(function() {
            // Initialize all collapses as closed except the first level
            $('.group-header').on('click', function() {
                $(this).find('.chevron-icon').toggleClass('fa-chevron-down fa-chevron-up');
            });
            
            // Search functionality would be implemented here
            $('input[type="text"]').on('keyup', function() {
                const searchText = $(this).val().toLowerCase();
                // Implementation would filter groups based on search
            });
            
            // Confirm before deleting
            $('.btn-outline-danger').on('click', function(e) {
                if (!confirm('Are you sure you want to delete this grade record?')) {
                    e.preventDefault();
                }
            });
        });