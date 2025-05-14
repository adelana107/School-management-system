 // Update unit count when courses are selected
    function updateUnitCount() {
        let totalUnits = 0;
        document.querySelectorAll('.course-checkbox:checked').forEach(checkbox => {
            totalUnits += parseInt(checkbox.dataset.unit);
        });
        document.getElementById('selected-units').textContent = totalUnits;
        
        // Visual feedback if exceeding limit
        const unitDisplay = document.getElementById('selected-units');
        if (totalUnits > 24) {
            unitDisplay.style.color = 'red';
            unitDisplay.innerHTML = `${totalUnits} <i class="fas fa-exclamation-triangle"></i>`;
        } else {
            unitDisplay.style.color = '';
            unitDisplay.textContent = totalUnits;
        }
    }

    // Submit selected courses
    function submitCourses() {
        const selectedCourses = [];
        document.querySelectorAll('.course-checkbox:checked').forEach(checkbox => {
            selectedCourses.push(checkbox.id.replace('course_', ''));
        });

        // Check if any courses are selected
        if (selectedCourses.length === 0) {
            showStatusMessage('Please select at least one course', 'danger');
            return;
        }

        // Check unit limit
        const totalUnits = parseInt(document.getElementById('selected-units').textContent);
        if (totalUnits > 24) {
            showStatusMessage('You have exceeded the maximum allowed units (24)', 'danger');
            return;
        }

        const csrfToken = document.getElementById("csrf-token").value;

        // Show loading state
        showStatusMessage('Processing your registration...', 'info');

        fetch("{% url 'submit_registration' %}", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ courses: selectedCourses })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showStatusMessage('Courses registered successfully!', 'success');
                // Optional: Disable checkboxes after successful registration
                document.querySelectorAll('.course-checkbox').forEach(cb => {
                    cb.disabled = true;
                });
            } else {
                showStatusMessage(data.message || "Registration failed", 'danger');
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showStatusMessage("An error occurred. Please try again.", 'danger');
        });
    }

    // Helper function to show status messages
    function showStatusMessage(message, type) {
        const statusDiv = document.getElementById("registration-status");
        const messageSpan = document.getElementById("status-message");
        
        // Set up alert
        const alert = statusDiv.querySelector(".alert");
        alert.className = `alert alert-dismissible fade show alert-${type}`;
        
        // Set message and show
        messageSpan.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i> ${message}`;
        statusDiv.style.display = "block";
        
        // Auto-dismiss after 5 seconds if success
        if (type === 'success') {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        }
    }

    // Initialize unit count on page load
    document.addEventListener('DOMContentLoaded', updateUnitCount);