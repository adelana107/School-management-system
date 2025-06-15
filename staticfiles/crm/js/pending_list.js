        $(document).ready(function() {
            // Search functionality
            $("#searchInput").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                
                $(".application-row").each(function() {
                    var rowText = $(this).text().toLowerCase();
                    $(this).toggle(rowText.indexOf(value) > -1);
                });
            });

            // Refresh button
            $("#refreshBtn").click(function() {
                location.reload();
            });

            // Approve button click
            let currentAppId = null;
            $(".approve-btn").click(function() {
                currentAppId = $(this).data("id");
                $("#approvalModal").modal("show");
            });

            // Confirm approval
            $("#confirmApprove").click(function() {
                if (currentAppId) {
                    // Send AJAX request to approve the application
                    $.ajax({
                        url: `/crm/approve_application/${currentAppId}/`,
                        method: "POST",
                        headers: {
                            "X-CSRFToken": "{{ csrf_token }}"
                        },
                        success: function(response) {
                            if (response.success) {
                                location.reload();
                            } else {
                                alert("Error approving application");
                            }
                        },
                        error: function() {
                            alert("Error approving application");
                        }
                    });
                }
                $("#approvalModal").modal("hide");
            });

            // Reject button click
            $(".reject-btn").click(function(e) {
                e.preventDefault();
                currentAppId = $(this).data("id");
                $("#rejectionModal").modal("show");
            });

            // Confirm rejection
            $("#confirmReject").click(function() {
                if (currentAppId) {
                    const reason = $("#rejectionReason").val();
                    
                    // Send AJAX request to reject the application
                    $.ajax({
                        url: `/crm/reject_application/${currentAppId}/`,
                        method: "POST",
                        data: {
                            reason: reason
                        },
                        headers: {
                            "X-CSRFToken": "{{ csrf_token }}"
                        },
                        success: function(response) {
                            if (response.success) {
                                location.reload();
                            } else {
                                alert("Error rejecting application");
                            }
                        },
                        error: function() {
                            alert("Error rejecting application");
                        }
                    });
                }
                $("#rejectionModal").modal("hide");
            });

            // Auto-expand accordion if search is active
            $("#searchInput").on("keyup", function() {
                if ($(this).val().length > 0) {
                    $(".accordion-collapse").addClass("show");
                }
            });
        });