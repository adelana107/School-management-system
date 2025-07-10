$(document).ready(function() {
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Toggle advanced filters
    $('#advancedFilterBtn').click(function() {
        $('#advancedFilters').collapse('toggle');
        $(this).toggleClass('active');
    });
    
    // Clear search input
    $('#clearSearch').click(function() {
        $('#searchInput').val('').trigger('keyup');
        $(this).css('opacity', '0');
    });
    
    // Reset all filters
    $('#resetFilters').click(function() {
        $('#searchInput').val('');
        $('#statusFilter, #sessionFilter, #schoolFilter, #departmentFilter').val('all');
        $('#dateFrom, #dateTo').val('');
        filterApplications();
        $('#clearSearch').css('opacity', '0');
    });
    
    // Debounced search function
    const debouncedSearch = _.debounce(function() {
        filterApplications();
    }, 300);
    
    // Search and filter event listeners
    $('#searchInput').on('keyup', function() {
        $(this).val().length > 0 ? $('#clearSearch').css('opacity', '1') : $('#clearSearch').css('opacity', '0');
        debouncedSearch();
    });
    
    $('#statusFilter, #sessionFilter, #schoolFilter, #departmentFilter, #dateFrom, #dateTo').change(filterApplications);
    $('#applyFilters').click(filterApplications);
    
    // Main filtering function
    function filterApplications() {
        const searchValue = $('#searchInput').val().toLowerCase();
        const statusFilter = $('#statusFilter').val();
        const sessionFilter = $('#sessionFilter').val();
        const schoolFilter = $('#schoolFilter').val();
        const departmentFilter = $('#departmentFilter').val();
        const dateFrom = $('#dateFrom').val();
        const dateTo = $('#dateTo').val();
        
        $('.application-row').each(function() {
            const rowText = $(this).text().toLowerCase();
            const rowStatus = $(this).data('status');
            const rowSession = $(this).data('session');
            const rowSchool = $(this).data('school');
            const rowDepartment = $(this).data('department');
            const rowDate = $(this).data('date');
            
            const textMatch = searchValue === '' || rowText.indexOf(searchValue) > -1;
            const statusMatch = statusFilter === 'all' || rowStatus === statusFilter;
            const sessionMatch = sessionFilter === 'all' || rowSession === sessionFilter;
            const schoolMatch = schoolFilter === 'all' || rowSchool === schoolFilter;
            const departmentMatch = departmentFilter === 'all' || rowDepartment === departmentFilter;
            const dateMatch = (!dateFrom || rowDate >= dateFrom) && (!dateTo || rowDate <= dateTo);
            
            $(this).toggle(
                textMatch && statusMatch && sessionMatch && schoolMatch && departmentMatch && dateMatch
            );
        });
        
        // Show/hide empty accordions
        $('.accordion-collapse').each(function() {
            const accordionId = $(this).attr('id');
            const hasVisibleRows = $(this).find('.application-row:visible').length > 0;
            const isEmptyMessage = $(this).find('.text-center:contains("No applications found")').length > 0;
            
            if (!hasVisibleRows && !isEmptyMessage) {
                $(this).find('tbody').append(
                    '<tr><td colspan="7" class="text-center py-4">No matching applications found</td></tr>'
                );
            } else if (hasVisibleRows && isEmptyMessage) {
                $(this).find('.text-center:contains("No applications found")').remove();
            }
        });
    }
    
    // Initialize chart
    const ctx = document.getElementById('applicationsChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Applications',
                data: [120, 190, 170, 220, 250, 280, 310, 290, 330, 380, 350, 400],
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }, {
                label: 'Approved',
                data: [80, 120, 110, 150, 180, 200, 220, 210, 230, 260, 240, 280],
                backgroundColor: 'rgba(56, 176, 0, 0.1)',
                borderColor: 'rgba(56, 176, 0, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Update chart based on time range
    $('#chartTimeRange').change(function() {
        // In a real app, you would fetch new data based on the selected range
        // This is just a simulation
        const range = $(this).val();
        let labels, data1, data2;
        
        if (range === 'week') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data1 = [45, 60, 75, 50, 65, 40, 55];
            data2 = [30, 40, 50, 35, 45, 25, 35];
        } else if (range === 'month') {
            labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
            data1 = Array.from({length: 30}, () => Math.floor(Math.random() * 50) + 20);
            data2 = Array.from({length: 30}, () => Math.floor(Math.random() * 30) + 15);
        } else {
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            data1 = [120, 190, 170, 220, 250, 280, 310, 290, 330, 380, 350, 400];
            data2 = [80, 120, 110, 150, 180, 200, 220, 210, 230, 260, 240, 280];
        }
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = data1;
        chart.data.datasets[1].data = data2;
        chart.update();
    });
    
    // Remember accordion state
    $('.accordion-button').click(function() {
        const target = $(this).attr('data-bs-target');
        const isCollapsed = $(target).hasClass('show');
        
        if (!isCollapsed) {
            localStorage.setItem(target, 'expanded');
        } else {
            localStorage.removeItem(target);
        }
    });
    
    // Restore accordion state on page load
    $('.accordion-collapse').each(function() {
        const id = '#' + $(this).attr('id');
        if (localStorage.getItem(id) === 'expanded') {
            $(this).addClass('show');
        }
    });
    
    // Auto-expand accordions when searching
    $('#searchInput').on('keyup', function() {
        if ($(this).val().length > 0) {
            $('.accordion-collapse').addClass('show');
        }
    });
});