document.addEventListener('DOMContentLoaded', function() {
            // Handle file selection display for SSCE
            const ssceInput = document.getElementById('ssce_result');
            const ssceFileName = document.getElementById('ssceFileName');
            const ssceError = document.getElementById('ssceError');
            
            ssceInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    ssceFileName.textContent = this.files[0].name;
                    ssceFileName.style.display = 'block';
                    ssceError.style.display = 'none';
                } else {
                    ssceFileName.style.display = 'none';
                }
            });
            
            // Handle file selection display for JAMB
            const jambInput = document.getElementById('jamb_result');
            const jambFileName = document.getElementById('jambFileName');
            const jambError = document.getElementById('jambError');
            
            jambInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    jambFileName.textContent = this.files[0].name;
                    jambFileName.style.display = 'block';
                    jambError.style.display = 'none';
                } else {
                    jambFileName.style.display = 'none';
                }
            });
            
            // Form validation
            const form = document.getElementById('screeningForm');
            form.addEventListener('submit', function(e) {
                let isValid = true;
                
                if (!ssceInput.files.length) {
                    ssceError.style.display = 'block';
                    isValid = false;
                }
                
                if (!jambInput.files.length) {
                    jambError.style.display = 'block';
                    isValid = false;
                }
                
                if (!isValid) {
                    e.preventDefault();
                }
            });
            
            // Drag and drop functionality
            const uploadAreas = document.querySelectorAll('.file-upload-button');
            
            uploadAreas.forEach(area => {
                area.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    area.style.borderColor = '#4a6fa5';
                    area.style.backgroundColor = 'rgba(74, 111, 165, 0.1)';
                });
                
                area.addEventListener('dragleave', () => {
                    area.style.borderColor = '#ccc';
                    area.style.backgroundColor = '#f5f7fa';
                });
                
                area.addEventListener('drop', (e) => {
                    e.preventDefault();
                    area.style.borderColor = '#ccc';
                    area.style.backgroundColor = '#f5f7fa';
                    
                    const input = area.previousElementSibling;
                    if (input && input.classList.contains('file-upload-input')) {
                        input.files = e.dataTransfer.files;
                        const event = new Event('change');
                        input.dispatchEvent(event);
                    }
                });
            });
        });