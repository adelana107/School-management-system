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



$(document).ready(function() {
            // Handle schedule button clicks
            $('.schedule-btn').click(function() {
                const courseId = $(this).data('course-id');
                $('#courseId').val(courseId);
                
                // Load existing schedules for this course
                $.get(`/api/courses/${courseId}/schedules/`, function(data) {
                    let schedulesHtml = '';
                    if (data.length > 0) {
                        data.forEach(schedule => {
                            schedulesHtml += `
                                <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                    <span class="badge bg-info">
                                        ${schedule.day} ${schedule.start_time} - ${schedule.end_time}
                                    </span>
                                    <button class="btn btn-sm btn-outline-danger delete-schedule" data-schedule-id="${schedule.id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            `;
                        });
                    } else {
                        schedulesHtml = '<p class="text-muted">No schedules added yet.</p>';
                    }
                    $('#currentSchedules').html(schedulesHtml);
                });
            });
            
            // Handle schedule form submission
            $('#scheduleForm').submit(function(e) {
                e.preventDefault();
                const courseId = $('#courseId').val();
                const formData = $(this).serialize();
                
                $.post(`/api/courses/${courseId}/schedules/`, formData, function(data) {
                    // Reload schedules after adding new one
                    $('.schedule-btn[data-course-id="' + courseId + '"]').click();
                });
            });
            
            // Handle schedule deletion
            $(document).on('click', '.delete-schedule', function() {
                const scheduleId = $(this).data('schedule-id');
                const courseId = $('#courseId').val();
                
                if (confirm('Are you sure you want to delete this schedule?')) {
                    $.ajax({
                        url: `/api/schedules/${scheduleId}/`,
                        type: 'DELETE',
                        success: function() {
                            // Reload schedules after deletion
                            $('.schedule-btn[data-course-id="' + courseId + '"]').click();
                        }
                    });
                }
            });
        });

// Add to your script section
$(document).ready(function() {
    // Preview file name when selected
    $('#id_syllabus').change(function() {
        const fileName = $(this).val().split('\\').pop();
        if (fileName) {
            $(this).next('.custom-file-label').html(fileName);
        }
    });

    // Handle syllabus removal
    $('#removeSyllabus').click(function() {
        $('#syllabusClear').val('true');
        $(this).closest('div').prev().find('.custom-file-label').html('Choose file');
        $(this).closest('div').hide();
    });
});


// Handle syllabus removal via AJAX
$('.remove-syllabus').click(function(e) {
    e.preventDefault();
    const courseId = $(this).data('course-id');
    const $row = $(this).closest('tr');
    
    if (confirm('Are you sure you want to delete this syllabus?')) {
        $.ajax({
            url: `/ajax/delete-syllabus/${courseId}/`,
            method: 'POST',
            headers: {
                'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function(response) {
                if (response.status === 'success') {
                    // Update the UI
                    $row.find('.syllabus-link').remove();
                    $row.find('.remove-syllabus').remove();
                    showToast('Syllabus deleted successfully', 'success');
                } else {
                    showToast(response.message, 'error');
                }
            },
            error: function(xhr) {
                showToast('Error deleting syllabus', 'error');
            }
        });
    }
});

// Helper function for toast notifications
function showToast(message, type) {
    const toastHtml = `
        <div class="toast show align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    $('.toast-container').append(toastHtml);
    setTimeout(() => $('.toast').last().remove(), 5000);
}