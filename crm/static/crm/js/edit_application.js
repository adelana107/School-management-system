$(document).ready(function () {
    $('.select2').select2({
        theme: 'bootstrap-5',
        width: '100%'
    });

    function loadLGAs(stateId, selectedLGAId = null) {
        const lgaSelect = $('#id_local_government');

        if (stateId) {
            lgaSelect.prop('disabled', true);
            $.getJSON('/get-lgas/', { state_id: stateId })
                .done(function (data) {
                    lgaSelect.empty().append('<option value="">---------</option>');
                    $.each(data, function (index, lga) {
                        const selected = selectedLGAId && (lga.id == selectedLGAId);
                        lgaSelect.append($('<option>', {
                            value: lga.id,
                            text: lga.name,
                            selected: selected
                        }));
                    });
                    lgaSelect.prop('disabled', false);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.error("Failed to load LGAs:", textStatus, errorThrown);
                    lgaSelect.prop('disabled', false);
                });
        } else {
            lgaSelect.empty().append('<option value="">---------</option>');
            lgaSelect.prop('disabled', true);
        }
    }

    function loadDepartments(schoolId, selectedDeptId = null) {
        const deptSelect = $('#id_department');

        if (schoolId) {
            deptSelect.prop('disabled', true);
            $.getJSON('/get-departments/', { school_id: schoolId })
                .done(function (data) {
                    deptSelect.empty().append('<option value="">---------</option>');
                    $.each(data, function (index, dept) {
                        const selected = selectedDeptId && (dept.id == selectedDeptId);
                        deptSelect.append($('<option>', {
                            value: dept.id,
                            text: dept.name,
                            selected: selected
                        }));
                    });
                    deptSelect.prop('disabled', false);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.error("Failed to load departments:", textStatus, errorThrown);
                    deptSelect.prop('disabled', false);
                });
        } else {
            deptSelect.empty().append('<option value="">---------</option>');
            deptSelect.prop('disabled', true);
        }
    }

    $('#id_state_of_origin').on('change', function () {
        const stateId = $(this).val();
        loadLGAs(stateId);
    });

    $('#id_school').on('change', function () {
        const schoolId = $(this).val();
        loadDepartments(schoolId);
    });

    $('#id_profile_picture').change(function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#profile-preview').attr('src', e.target.result);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    const stateId = $('#id_state_of_origin').val();
    const schoolId = $('#id_school').val();
    const currentLGAId = $('#current_lga').val();
    const currentDeptId = $('#current_dept').val();

    if (stateId) {
        loadLGAs(stateId, currentLGAId);
    }

    if (schoolId) {
        loadDepartments(schoolId, currentDeptId);
    }
});
