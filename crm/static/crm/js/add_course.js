// Form validation
        (function() {
            'use strict';
            var form = document.getElementById('courseForm');
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        })();

        // Search Functionality
        $('#searchInput').on('input', function() {
            const searchValue = $(this).val().toLowerCase();
            $('tbody tr').each(function() {
                const rowText = $(this).text().toLowerCase();
                $(this).toggle(rowText.includes(searchValue));
            });
        });

        // Clear search
        $('#clearSearch').click(function() {
            $('#searchInput').val('').trigger('input');
        });

        // Dynamic department loading
        $('#id_school').change(function() {
            const schoolId = $(this).val();
            const departmentSelect = $('#id_department');
            
            if (schoolId) {
                $.ajax({
                    url: '/ajax/load-departments/',
                    data: { 'school_id': schoolId },
                    beforeSend: function() {
                        departmentSelect.prop('disabled', true);
                        departmentSelect.html('<option value="">Loading departments...</option>');
                    },
                    success: function(data) {
                        departmentSelect.empty();
                        departmentSelect.append('<option value="">Select department</option>');
                        $.each(data, function(index, department) {
                            departmentSelect.append(
                                $('<option></option>').val(department.id).text(department.name)
                            );
                        });
                        departmentSelect.prop('disabled', false);
                    },
                    error: function() {
                        departmentSelect.html('<option value="">Error loading departments</option>');
                    }
                });
            } else {
                departmentSelect.prop('disabled', true);
                departmentSelect.html('<option value="">Select school first</option>');
            }
        });

        // Initialize department dropdown if school is pre-selected
        if ($('#id_school').val()) {
            $('#id_school').trigger('change');
        }

        // Auto-dismiss toasts after 5 seconds
        $('.toast').each(function() {
            const toast = new bootstrap.Toast(this);
            toast.show();
            setTimeout(() => toast.hide(), 5000);
        });

        // Edit button functionality
        $('.edit-btn').click(function() {
            const courseId = $(this).data('course-id');
            // Here you would typically load the course data into the modal
            // For now, we'll just show the modal
            $('#courseModal').modal('show');
        });

        // Floating action button animation
        $(window).scroll(function() {
            if ($(this).scrollTop() > 100) {
                $('#quickAddBtn').addClass('show');
            } else {
                $('#quickAddBtn').removeClass('show');
            }
        });