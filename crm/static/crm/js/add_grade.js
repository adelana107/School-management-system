$(document).ready(function() {
            // Form validation
            (function() {
                'use strict';
                var forms = document.querySelectorAll('.needs-validation');
                Array.prototype.slice.call(forms).forEach(function(form) {
                    form.addEventListener('submit', function(event) {
                        if (!form.checkValidity()) {
                            event.preventDefault();
                            event.stopPropagation();
                        } else {
                            $('#submitBtn').prop('disabled', true);
                            $('#submitBtn .spinner-border').removeClass('d-none');
                            $('#submitBtn i').addClass('d-none');
                        }
                        form.classList.add('was-validated');
                    }, false);
                });
            })();

            // Filter departments based on selected school
            $('#id_school').change(function() {
                const schoolId = $(this).val();
                const departmentSelect = $('#id_department');
                
                if (schoolId) {
                    departmentSelect.prop('disabled', false);
                    departmentSelect.find('option').each(function() {
                        const option = $(this);
                        if (option.val() === "" || option.data('school') == schoolId) {
                            option.show();
                        } else {
                            option.hide();
                        }
                    });
                    departmentSelect.val('');
                    $('#id_student, #id_semester, #id_course').prop('disabled', true).val('');
                } else {
                    departmentSelect.prop('disabled', true).val('');
                    $('#id_student, #id_semester, #id_course').prop('disabled', true).val('');
                }
            });

            // Filter students based on selected department
            $('#id_department').change(function() {
                const deptId = $(this).val();
                const studentSelect = $('#id_student');
                
                if (deptId) {
                    studentSelect.prop('disabled', false);
                    studentSelect.find('option').each(function() {
                        const option = $(this);
                        if (option.val() === "" || option.data('department') == deptId) {
                            option.show();
                        } else {
                            option.hide();
                        }
                    });
                    studentSelect.val('');
                    $('#id_semester, #id_course').prop('disabled', true).val('');
                } else {
                    studentSelect.prop('disabled', true).val('');
                    $('#id_semester, #id_course').prop('disabled', true).val('');
                }
            });

            // Enable semester selection
            $('#id_student').change(function() {
                const studentId = $(this).val();
                const semesterSelect = $('#id_semester');
                
                if (studentId) {
                    semesterSelect.prop('disabled', false).val('');
                    $('#id_course').prop('disabled', true).val('');
                } else {
                    semesterSelect.prop('disabled', true).val('');
                    $('#id_course').prop('disabled', true).val('');
                }
            });

            // Filter courses based on selected semester AND department
            $('#id_semester, #id_department').change(function() {
                const semesterId = $('#id_semester').val();
                const departmentId = $('#id_department').val();
                const courseSelect = $('#id_course');
                
                if (semesterId && departmentId) {
                    courseSelect.prop('disabled', false);
                    courseSelect.find('option').each(function() {
                        const option = $(this);
                        if (option.val() === "") {
                            option.show();
                        } else {
                            const matchesSemester = option.data('semester') == semesterId;
                            const matchesDepartment = option.data('department') == departmentId;
                            option.toggle(matchesSemester && matchesDepartment);
                        }
                    });
                    courseSelect.val('');
                } else {
                    courseSelect.prop('disabled', true).val('');
                }
            });

            // Initialize form state
            if ($('#id_school').val()) {
                $('#id_school').trigger('change');
            }

            // Auto-dismiss alerts after 5 seconds
            setTimeout(function() {
                $('.alert').alert('close');
            }, 5000);
        });