    // Pass Django variables to JS
        const submitRegistrationUrl = "{% url 'submit_registration' %}";
        const csrfToken = "{{ csrf_token }}";

        // Update unit count when courses are selected
        function updateUnitCount() {
            let totalUnits = 0;
            document.querySelectorAll('.course-checkbox:checked').forEach(checkbox => {
                totalUnits += parseInt(checkbox.dataset.unit, 10);
            });

            const unitDisplay = document.getElementById('selected-units');
            if (totalUnits > 24) {
                unitDisplay.style.color = 'red';
                unitDisplay.innerHTML = `${totalUnits} <i class="fas fa-exclamation-triangle"></i>`;
            } else {
                unitDisplay.style.color = '';
                unitDisplay.textContent = totalUnits;
            }
        }

        // Show status messages
        function showStatusMessage(message, type) {
            const statusDiv = document.getElementById("registration-status");
            const alert = statusDiv.querySelector(".alert");
            const messageSpan = document.getElementById("status-message");

            alert.className = `alert alert-dismissible fade show alert-${type}`;
            messageSpan.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i> ${message}`;
            statusDiv.style.display = "block";

            // Auto-dismiss success message after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }, 5000);
            }
        }

        // Submit selected courses
        function submitCourses() {
            const selectedCourses = Array.from(document.querySelectorAll('.course-checkbox:checked'))
                                        .map(cb => cb.id.replace('course_', ''));

            if (selectedCourses.length === 0) {
                showStatusMessage('Please select at least one course.', 'danger');
                return;
            }

            const totalUnitsText = document.getElementById('selected-units').textContent;
            const totalUnits = parseInt(totalUnitsText, 10);
            if (totalUnits > 24) {
                showStatusMessage('You have exceeded the maximum allowed units (24).', 'danger');
                return;
            }

            showStatusMessage('Processing your registration...', 'info');

            fetch(submitRegistrationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ courses: selectedCourses }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showStatusMessage('Courses registered successfully!', 'success');
                    // Disable checkboxes after success
                    document.querySelectorAll('.course-checkbox').forEach(cb => cb.disabled = true);
                } else {
                    showStatusMessage(data.message || 'Registration failed', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showStatusMessage('An error occurred. Please try again.', 'danger');
            });
        }

        // Initialize unit count on page load
        document.addEventListener('DOMContentLoaded', updateUnitCount);