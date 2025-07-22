    const hasSSCEResult = {% if screening.ssce_result %}true{% else %}false{% endif %};
        const hasJAMBResult = {% if screening.jamb_result %}true{% else %}false{% endif %};

        const ssceResultUrl = "{% if screening.ssce_result %}{{ screening.ssce_result.url }}{% else %}#{% endif %}";
        const jambResultUrl = "{% if screening.jamb_result %}{{ screening.jamb_result.url }}{% else %}#{% endif %}";

        function zoomDocument(type) {
            const modal = new bootstrap.Modal(document.getElementById('documentZoomModal'));
            const title = document.getElementById('zoomModalTitle');
            const img = document.getElementById('zoomedDocument');
            const downloadLink = document.getElementById('downloadDocument');

            if (type === 'ssce') {
                title.textContent = 'SSCE Result - {{ screening.student }}';
                if (hasSSCEResult) {
                    img.src = ssceResultUrl;
                    downloadLink.href = ssceResultUrl;
                } else {
                    alert('No SSCE Result file uploaded.');
                    return;
                }
            } else if (type === 'jamb') {
                title.textContent = 'JAMB Result - {{ screening.student }}';
                if (hasJAMBResult) {
                    img.src = jambResultUrl;
                    downloadLink.href = jambResultUrl;
                } else {
                    alert('No JAMB Result file uploaded.');
                    return;
                }
            }

            modal.show();
        }

        // Initialize tooltips
        document.addEventListener('DOMContentLoaded', function () {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        });