 // Initialize Select2
        $(document).ready(function() {
            $('.form-select').select2({
                width: '100%',
                theme: 'bootstrap'
            });
            
            // Profile picture preview
            $('#id_profile_picture').change(function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        $('#profilePicturePreview').attr('src', event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Dynamic department dropdown based on school selection
            $('#id_school').change(function() {
                const schoolId = $(this).val();
                if (schoolId) {
                    $.ajax({
                        url: '{% url "get_departments" %}',
                        data: {
                            'school_id': schoolId
                        },
                        success: function(data) {
                            $('#id_department').empty();
                            $.each(data, function(key, value) {
                                $('#id_department').append($('<option></option>').attr('value', value.id).text(value.name));
                            });
                        }
                    });
                } else {
                    $('#id_department').empty();
                }
            });
            
            // Dynamic LGA dropdown based on state selection
            $('#id_state_of_origin').change(function() {
                const stateId = $(this).val();
                if (stateId) {
                    $.ajax({
                        url: '{% url "get_lgas" %}',
                        data: {
                            'state_id': stateId
                        },
                        success: function(data) {
                            $('#id_local_government').empty();
                            $.each(data, function(key, value) {
                                $('#id_local_government').append($('<option></option>').attr('value', value.id).text(value.name));
                            });
                        }
                    });
                } else {
                    $('#id_local_government').empty();
                }
            });
            
            // Initialize department and LGA fields if they have values
            {% if form.instance.school %}
                $.ajax({
                    url: '{% url "get_departments" %}',
                    data: {
                        'school_id': '{{ form.instance.school.id }}'
                    },
                    success: function(data) {
                        $('#id_department').empty();
                        $.each(data, function(key, value) {
                            $('#id_department').append($('<option></option>').attr('value', value.id).text(value.name));
                        });
                        $('#id_department').val('{{ form.instance.department.id }}').trigger('change');
                    }
                });
            {% endif %}
            
            {% if form.instance.state_of_origin %}
                $.ajax({
                    url: '{% url "get_lgas" %}',
                    data: {
                        'state_id': '{{ form.instance.state_of_origin.id }}'
                    },
                    success: function(data) {
                        $('#id_local_government').empty();
                        $.each(data, function(key, value) {
                            $('#id_local_government').append($('<option></option>').attr('value', value.id).text(value.name));
                        });
                        $('#id_local_government').val('{{ form.instance.local_government.id }}').trigger('change');
                    }
                });
            {% endif %}
        });