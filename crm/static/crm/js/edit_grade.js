 $(document).ready(function() {
            // Form validation
            (function () {
                'use strict';
                var forms = document.querySelectorAll('.needs-validation');
                Array.prototype.slice.call(forms).forEach(function (form) {
                    form.addEventListener('submit', function (event) {
                        if (!form.checkValidity()) {
                            event.preventDefault();
                            event.stopPropagation();
                        } else {
                            $('#submitBtn').prop('disabled', true);
                            $('.spinner-border').removeClass('d-none');
                            $('#submitBtn i').hide();
                        }
                        form.classList.add('was-validated');
                    }, false);
                });
            })();

            const semesterSelect = $('#id_semester');
            const courseSelect = $('#id_course');

            function loadCourses(semesterId) {
                if (semesterId) {
                    $.ajax({
                        url: '/ajax/load-courses/',
                        data: {
                            'semester_id': semesterId
                        },
                        beforeSend: function () {
                            courseSelect.prop('disabled', true);
                            courseSelect.html('<option>Loading...</option>');
                        },
                        success: function (data) {
                            courseSelect.empty();
                            if (data.length > 0) {
                                $.each(data, function (index, course) {
                                    courseSelect.append(
                                        $('<option></option>').val(course.id).text(course.title + ' (' + course.code + ')')
                                    );
                                });
                            } else {
                                courseSelect.append('<option value="">No courses found</option>');
                            }
                        },
                        error: function () {
                            courseSelect.html('<option>Error loading courses</option>');
                        },
                        complete: function () {
                            courseSelect.prop('disabled', false);
                        }
                    });
                }
            }

            semesterSelect.change(function () {
                loadCourses($(this).val());
            });

            // Load courses initially for edit
            if (semesterSelect.val()) {
                loadCourses(semesterSelect.val());
            }
        });