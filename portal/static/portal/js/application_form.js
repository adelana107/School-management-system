// Image preview functionality
        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function(e) {
                    var preview = document.getElementById('image-preview');
                    preview.style.display = 'block';
                    preview.src = e.target.result;
                }
                
                reader.readAsDataURL(input.files[0]);
            }
        }

        document.getElementById('id_profile_picture').addEventListener('change', function() {
            readURL(this);
        });

        // When school is changed, fetch related departments
        $('#id_school').change(function () {
            var schoolId = $(this).val();
            console.log("Selected School ID:", schoolId);

            if (schoolId) {
                $.ajax({
                    url: '/get_departments/',
                    data: {
                        'school_id': schoolId
                    },
                    success: function (data) {
                        let options = '<option value="">---------</option>';
                        data.departments.forEach(function (dept) {
                            options += `<option value="${dept.id}">${dept.name}</option>`;
                        });
                        $('#id_department').html(options);
                    },
                    error: function (xhr, errmsg, err) {
                        console.log("Error fetching departments:", errmsg);
                    }
                });
            } else {
                $('#id_department').html('<option value="">---------</option>');
            }
        });

        // When state is changed, fetch related LGAs
        $('#id_state_of_origin').change(function () {
            var stateId = $(this).val();
            console.log("Selected State ID:", stateId);

            if (stateId) {
                $.ajax({
                    url: '/get_lgas/',
                    data: {
                        'state_id': stateId
                    },
                    success: function (data) {
                        let options = '<option value="">---------</option>';
                        data.lgas.forEach(function (lga) {
                            options += `<option value="${lga.id}">${lga.name}</option>`;
                        });
                        $('#id_local_government').html(options);
                    },
                    error: function (xhr, errmsg, err) {
                        console.log("Error fetching LGAs:", errmsg);
                    }
                });
            } else {
                $('#id_local_government').html('<option value="">---------</option>');
            }
        });