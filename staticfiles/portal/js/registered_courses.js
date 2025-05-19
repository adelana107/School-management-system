// Initialize DataTable
        $(document).ready(function() {
            $('#coursesTable').DataTable({
                responsive: true,
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search courses...",
                },
                dom: '<"top"f>rt<"bottom"lip><"clear">',
                pageLength: 10,
                columnDefs: [
                    { responsivePriority: 1, targets: 0 }, // Course code
                    { responsivePriority: 2, targets: 1 }, // Course title
                    { responsivePriority: 3, targets: -1 }, // Actions
                    { responsivePriority: 4, targets: 2 }, // Units
                    { responsivePriority: 5, targets: 3 }, // Type
                    { responsivePriority: 6, targets: 4 }, // Lecturer
                    { responsivePriority: 7, targets: 5 }  // Status
                ]
            });
        });

        // Print Styles
        function beforePrint() {
            $('.navbar, .action-buttons, .dataTables_filter, .dataTables_info, .dataTables_paginate').hide();
            $('.main-content').css({
                'padding': '0',
                'margin': '0'
            });
            $('.header-title').css({
                'color': 'black',
                'text-align': 'center',
                'margin-bottom': '1rem'
            });
            $('.table th').css({
                'background-color': '#f8f9fa !important',
                'color': 'black !important',
                'border': '1px solid #dee2e6'
            });
            $('.table td').css('border', '1px solid #dee2e6');
            $('.card-summary').css({
                'background-color': '#f8f9fa !important',
                'border': '1px solid #dee2e6',
                'margin-bottom': '1rem'
            });
            $('.badge').css({
                'color': 'black !important',
                'background-color': 'transparent !important',
                'border': '1px solid black'
            });
        }

        function afterPrint() {
            $('.navbar, .action-buttons, .dataTables_filter, .dataTables_info, .dataTables_paginate').show();
        }

        // Set up print event listeners
        if (window.matchMedia) {
            const mediaQueryList = window.matchMedia('print');
            mediaQueryList.addListener((mql) => {
                if (mql.matches) {
                    beforePrint();
                } else {
                    afterPrint();
                }
            });
        }

        window.onbeforeprint = beforePrint;
        window.onafterprint = afterPrint;