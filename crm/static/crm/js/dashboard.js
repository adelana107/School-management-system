/**
 * University CRM Dashboard - Main JavaScript File
 * Optimized for performance, accessibility, and maintainability
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initCharts();
    initTooltips();
    initEventListeners();
    initCounterAnimations();
    initDarkMode();
    initFilters();
});

/**
 * Initialize all chart components
 */
function initCharts() {
    // Applications Trend Chart
    const ctx = document.getElementById('applicationsChart')?.getContext('2d');
    if (ctx) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const applicationsData = [120, 190, 170, 220, 250, 280, 310, 290, 330, 380, 410, 450];
        const admittedData = [80, 120, 110, 150, 170, 190, 200, 180, 220, 250, 270, 300];
        
        new Chart(ctx, {
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
            options: getChartOptions()
        });
    }
}

/**
 * Get common chart options
 */
function getChartOptions() {
    return {
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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
                },
                ticks: {
                    callback: function(value) {
                        return value >= 1000 ? `${value/1000}k` : value;
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                }
            }
        }
    };
}

/**
 * Initialize all Bootstrap tooltips
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover focus'
        });
    });
}

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Sidebar toggle
    document.querySelector('.sidebar-toggle')?.addEventListener('click', toggleSidebar);
    
    // Search functionality with debounce
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Chart range dropdown
    document.querySelectorAll('[data-range]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            updateChartRange(this);
        });
    });
    
    // Application status updates
    document.querySelectorAll('.status-action').forEach(btn => {
        btn.addEventListener('click', function() {
            const appId = this.dataset.appId;
            const status = this.dataset.status;
            updateApplicationStatus(appId, status);
        });
    });
}

/**
 * Toggle sidebar collapse/expand
 */
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
    
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', 
        document.querySelector('.sidebar').classList.contains('collapsed'));
}

/**
 * Handle search with debounce
 */
function handleSearch(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    if (searchTerm.length > 2) {
        fetchSearchResults(searchTerm);
    }
}

/**
 * Debounce function to limit rapid calls
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Update chart range based on selection
 */
function updateChartRange(element) {
    const range = parseInt(element.getAttribute('data-range'));
    const dropdown = document.getElementById('chartRangeDropdown');
    
    // Update UI
    dropdown.textContent = element.textContent;
    document.querySelectorAll('[data-range]').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // In a real app, we would fetch new data here
    console.log(`Updating chart to show last ${range} months`);
}

/**
 * Initialize counter animations
 */
function initCounterAnimations() {
    document.querySelectorAll('.counter-value').forEach(counter => {
        animateCounter(counter);
    });
}

/**
 * Animate counter element
 */
function animateCounter(counter) {
    const target = +counter.getAttribute('data-target');
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const value = Math.floor(progress * target);
        
        counter.textContent = value.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Initialize dark mode
 */
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (savedMode === null && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}

/**
 * Initialize dashboard filters
 */
function initFilters() {
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const filterValue = this.getAttribute('data-filter');
            updateDashboardFilters(filterValue);
        });
    });
}

/**
 * Update dashboard with filtered data
 */
function updateDashboardFilters(filter) {
    showLoadingState(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
        console.log(`Filtering dashboard for: ${filter}`);
        // In a real app, you would update the DOM with new data here
        showLoadingState(false);
    }, 800);
}

/**
 * Show/hide loading state
 */
function showLoadingState(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

/**
 * Update application status via API
 */
function updateApplicationStatus(appId, status) {
    fetch(`/api/applications/${appId}/status/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ status: status })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            updateApplicationStatusUI(appId, status);
        }
    })
    .catch(error => {
        console.error('Error updating application status:', error);
        showToast('Failed to update application status', 'error');
    });
}

/**
 * Update UI after status change
 */
function updateApplicationStatusUI(appId, status) {
    const statusBadge = document.querySelector(`#application-${appId} .status-badge`);
    if (statusBadge) {
        statusBadge.className = `badge rounded-pill ${status === 'approved' ? 'badge-approved' : 'badge-pending'}`;
        statusBadge.innerHTML = `<i class="fas ${status === 'approved' ? 'fa-check-circle' : 'fa-clock'} me-1"></i> ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        showToast('Application status updated successfully', 'success');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Implement your toast notification system here
    console.log(`${type.toUpperCase()}: ${message}`);
}

/**
 * Get CSRF token from cookies
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

/**
 * Fetch search results from API
 */
function fetchSearchResults(query) {
    // Implement your search functionality here
    console.log(`Searching for: ${query}`);
}

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initCharts,
        initTooltips,
        initEventListeners,
        debounce,
        animateCounter,
        getCookie
    };
}


    //    <!-- Inline Script for Initialization -->
    
        document.addEventListener('DOMContentLoaded', function() {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Counter animation for approved applications
            const counterElements = document.querySelectorAll('.counter-value');
            counterElements.forEach(element => {
                const target = parseInt(element.getAttribute('data-target'));
                const duration = 2000; // Animation duration in ms
                const step = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        element.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        element.textContent = target;
                    }
                };
                
                updateCounter();
            });
        });