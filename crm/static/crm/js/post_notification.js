 // Image preview
        document.getElementById('id_image').addEventListener('change', function(e) {
            const preview = document.getElementById('imagePreview');
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(this.files[0]);
            }
        });

        // Send test notification via Telegram
        document.getElementById('sendTestTelegram').addEventListener('click', function() {
            const title = document.getElementById('id_title').value;
            const message = document.getElementById('id_message').value;
            
            if (!title || !message) {
                alert('Please fill in title and message fields first');
                return;
            }
            
            if (confirm('Send test notification to your Telegram account?')) {
                // Here you would typically make an AJAX call to your backend
                // that handles Telegram notifications
                fetch('/send-test-telegram/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': '{{ csrf_token }}'
                    },
                    body: JSON.stringify({
                        title: title,
                        message: message
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Test notification sent successfully!');
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to send test notification');
                });
            }
        });

        // Resend notification
        function resendNotification(notificationId) {
            if (confirm('Resend this notification to all recipients?')) {
                fetch(`/resend-notification/${notificationId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': '{{ csrf_token }}'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Notification resent successfully!');
                        location.reload();
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to resend notification');
                });
            }
        }