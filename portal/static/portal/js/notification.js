document.addEventListener('DOMContentLoaded', function() {
            function getCookie(name) {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
            const csrftoken = getCookie('csrftoken');

            // Filter notifications
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.dataset.filter;
                    const notifications = document.querySelectorAll('.notification-item');
                    
                    notifications.forEach(notification => {
                        const matchesCategory = filter === 'all' || notification.dataset.category === filter;
                        const matchesUnread = filter !== 'unread' || notification.dataset.read === 'False';
                        
                        if (matchesCategory && matchesUnread) {
                            notification.style.display = 'flex';
                        } else {
                            notification.style.display = 'none';
                        }
                    });
                });
            });
            
            // Search functionality
            const searchInput = document.getElementById('notification-search');
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const notifications = document.querySelectorAll('.notification-item');
                
                notifications.forEach(notification => {
                    const text = notification.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        notification.style.display = 'flex';
                    } else {
                        notification.style.display = 'none';
                    }
                });
            });
            
            // Mark all as read
            document.getElementById('mark-all-read').addEventListener('click', function() {
                const btn = this;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
                
                fetch('{% url "mark_all_notifications_read" %}', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken,
                        'Content-Type': 'application/json'
                    },
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        // Update all unread notifications in the UI
                        document.querySelectorAll('.notification-item[data-read="False"]').forEach(item => {
                            item.dataset.read = "True";
                            item.classList.remove('unread');
                            const badge = item.querySelector('.badge.bg-danger');
                            if (badge) badge.remove();
                            const title = item.querySelector('h6');
                            if (title) title.classList.remove('fw-bold');
                        });
                        
                        // Update unread count badge
                        const unreadBadge = document.querySelector('.badge.bg-primary');
                        if (unreadBadge) unreadBadge.textContent = '0 unread';
                        
                        // Show success toast
                        const toast = document.createElement('div');
                        toast.className = 'position-fixed bottom-0 end-0 p-3';
                        toast.innerHTML = `
                            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                                <div class="toast-header bg-success text-white">
                                    <strong class="me-auto">Success</strong>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                                </div>
                                <div class="toast-body">
                                    Marked ${data.count} notifications as read
                                </div>
                            </div>
                        `;
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 3000);
                    } else {
                        throw new Error(data.error || 'Unknown error occurred');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to mark notifications as read: ' + error.message);
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check-double me-1"></i> Mark all as read';
                });
            });
            
// Clear all notifications
document.getElementById('clear-notifications').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
        
        fetch('{% url "clear_all_notifications" %}', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Clear the notifications list
                document.getElementById('notifications-list').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-bell-slash"></i>
                        <h4 class="text-muted">No notifications yet</h4>
                        <p class="text-muted">When you get notifications, they'll appear here</p>
                    </div>
                `;
                
                // Update unread count badge
                const unreadBadge = document.querySelector('.badge.bg-primary');
                if (unreadBadge) unreadBadge.textContent = '0 unread';
                
                // Show success message
                showToast('success', `Cleared ${data.count} notifications`);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('danger', 'Failed to clear notifications: ' + error.message);
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-trash-alt me-1"></i> Clear all';
        });
    }
});

// Helper function to show toast messages
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
            // Mark as read when clicked
            document.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    if (this.dataset.read === 'False') {
                        const notificationId = this.dataset.id;
                        fetch(`/notifications/mark-read/${notificationId}/`, {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken,
                                'Content-Type': 'application/json'
                            },
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                this.dataset.read = "True";
                                this.classList.remove('unread');
                                const badge = this.querySelector('.badge.bg-danger');
                                if (badge) badge.remove();
                                const title = this.querySelector('h6');
                                if (title) title.classList.remove('fw-bold');
                                
                                const unreadBadge = document.querySelector('.badge.bg-primary');
                                if (unreadBadge) {
                                    const currentCount = parseInt(unreadBadge.textContent);
                                    unreadBadge.textContent = `${currentCount - 1} unread`;
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    }
                });
            });
        });