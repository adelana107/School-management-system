        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the applications trend chart
            const ctx = document.getElementById('applicationsChart').getContext('2d');
            
            // Sample data - replace with your actual data from Django context
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const applicationsData = [120, 190, 170, 220, 250, 280, 310, 290, 330, 380, 410, 450];
            const admittedData = [80, 120, 110, 150, 170, 190, 200, 180, 220, 250, 270, 300];
            
            const applicationsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Applications',
                            data: applicationsData,
                            borderColor: '#4e73df',
                            backgroundColor: 'rgba(78, 115, 223, 0.05)',
                            tension: 0.3,
                            fill: true,
                            borderWidth: 2
                        },
                        {
                            label: 'Admitted',
                            data: admittedData,
                            borderColor: '#1cc88a',
                            backgroundColor: 'rgba(28, 200, 138, 0.05)',
                            tension: 0.3,
                            fill: true,
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString();
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    }
                }
            });

            // Chart range dropdown functionality
            document.querySelectorAll('[data-range]').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const range = parseInt(this.getAttribute('data-range'));
                    
                    // Update the dropdown text
                    document.getElementById('chartRangeDropdown').textContent = this.textContent;
                    
                    // Remove active class from all items
                    document.querySelectorAll('[data-range]').forEach(el => {
                        el.classList.remove('active');
                    });
                    
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // Here you would typically make an AJAX call to get new data based on the range
                    // For now, we'll just simulate it by slicing the existing data
                    const newMonths = months.slice(0, range);
                    const newApplicationsData = applicationsData.slice(0, range);
                    const newAdmittedData = admittedData.slice(0, range);
                    
                    // Update chart data
                    applicationsChart.data.labels = newMonths;
                    applicationsChart.data.datasets[0].data = newApplicationsData;
                    applicationsChart.data.datasets[1].data = newAdmittedData;
                    applicationsChart.update();
                });
            });

            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Sidebar toggle functionality
            const sidebarToggle = document.querySelector('.sidebar-toggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function() {
                    document.querySelector('.sidebar').classList.toggle('collapsed');
                    document.querySelector('.main-content').classList.toggle('expanded');
                });
            }

            // Search functionality
            const searchInput = document.querySelector('.search-box input');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase();
                    // You would typically make an AJAX call here to search applications
                    console.log('Searching for:', searchTerm);
                });
            }
        });

        // Function to handle application status updates
        function updateApplicationStatus(applicationId, status) {
            // You would typically make an AJAX call here to update the application status
            console.log(`Updating application ${applicationId} to status: ${status}`);
            
            // Example using fetch API
            /*
            fetch(`/api/applications/${applicationId}/status/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ status: status })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the UI to reflect the new status
                    const statusBadge = document.querySelector(`#application-${applicationId} .status-badge`);
                    statusBadge.className = `badge rounded-pill ${status === 'approved' ? 'badge-approved' : 'badge-pending'}`;
                    statusBadge.innerHTML = `<i class="fas ${status === 'approved' ? 'fa-check-circle' : 'fa-clock'} me-1"></i> ${status.charAt(0).toUpperCase() + status.slice(1)}`;
                }
            });
            */
        }

        // Helper function to get CSRF token
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