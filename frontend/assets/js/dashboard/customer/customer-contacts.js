const CustomerContacts = {
    init: function() {
        this.loadContactRequestsCount();
    },

    loadPendingContactRequests: function() {
        $("#contactRequestsList").html(`
            <div class="text-center p-3">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading contact requests...</span>
            </div>
        `);

        API.getPendingContactRequests()
            .then(data => {
                const pendingRequests = data.pending_requests || [];

                if (pendingRequests.length === 0) {
                    $("#contactRequestsList").html(`
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            You don't have any pending contact requests.
                        </div>
                    `);
                    $(".contact-requests-badge").addClass("d-none").text("0");
                    return;
                }

                // Update the badge
                $(".contact-requests-badge").removeClass("d-none").text(pendingRequests.length);

                // Create the requests list HTML
                const requestsHtml = pendingRequests.map(request => `
                    <div class="card mb-3 request-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="flex-shrink-0">
                                    <img src="../assets/images/default-avatar.jpg" class="rounded-circle" width="50" height="50" alt="User">
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h6 class="mb-0">${request.sender_name}</h6>
                                    <p class="text-muted small mb-0">Request sent ${formatTimeAgo(request.created_at)}</p>
                                </div>
                            </div>
                            
                            ${request.message ? `
                                <div class="mb-3">
                                    <p class="mb-0">${request.message}</p>
                                </div>
                            ` : ''}
                            
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-sm btn-outline-danger me-2 reject-request-btn" data-id="${request.id}">
                                    <i class="bi bi-x-circle me-1"></i> Decline
                                </button>
                                <button class="btn btn-sm btn-primary accept-request-btn" data-id="${request.id}" data-sender-name="${request.sender_name}">
                                    <i class="bi bi-check-circle me-1"></i> Accept
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');

                $("#contactRequestsList").html(requestsHtml);

                // Set up event handlers
                $(".accept-request-btn").on("click", function() {
                    const requestId = $(this).data('id');
                    const senderName = $(this).data('sender-name');
                    CustomerContacts.acceptContactRequest(requestId, senderName);
                });

                $(".reject-request-btn").on("click", function() {
                    const requestId = $(this).data('id');
                    CustomerContacts.rejectContactRequest(requestId);
                });
            })
            .catch(error => {
                console.error("Failed to load contact requests:", error);
                $("#contactRequestsList").html(`
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-circle me-2"></i>
                        Failed to load contact requests. Please try again.
                    </div>
                `);
            });
    },

    acceptContactRequest: function(requestId, senderName) {
        const $requestCard = $(`.accept-request-btn[data-id="${requestId}"]`).closest('.request-card');

        // Disable buttons and show loading state
        $requestCard.find('button').prop('disabled', true);
        $requestCard.find('.accept-request-btn').html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Accepting...
        `);

        API.acceptContactRequest(requestId)
            .then(response => {
                showNotification(`Request from ${senderName} accepted. You can now message each other.`, "success");

                // Remove the card with animation
                $requestCard.fadeOut(300, function() {
                    $(this).remove();

                    // Check if there are no more requests
                    if ($("#contactRequestsList .request-card").length === 0) {
                        $("#contactRequestsList").html(`
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                You don't have any pending contact requests.
                            </div>
                        `);
                        $(".contact-requests-badge").addClass("d-none").text("0");
                    }
                });

                // Refresh the conversations list
                CustomerMessages.loadMessages();
            })
            .catch(error => {
                console.error("Failed to accept contact request:", error);

                // Reset button state
                $requestCard.find('button').prop('disabled', false);
                $requestCard.find('.accept-request-btn').html(`
                    <i class="bi bi-check-circle me-1"></i> Accept
                `);

                showNotification("Failed to accept request. Please try again.", "error");
            });
    },

    rejectContactRequest: function(requestId) {
        const $requestCard = $(`.reject-request-btn[data-id="${requestId}"]`).closest('.request-card');

        // Disable buttons and show loading state
        $requestCard.find('button').prop('disabled', true);
        $requestCard.find('.reject-request-btn').html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Declining...
        `);

        API.rejectContactRequest(requestId)
            .then(response => {
                showNotification("Contact request declined.", "info");

                // Remove the card with animation
                $requestCard.fadeOut(300, function() {
                    $(this).remove();

                    // Check if there are no more requests
                    if ($("#contactRequestsList .request-card").length === 0) {
                        $("#contactRequestsList").html(`
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                You don't have any pending contact requests.
                            </div>
                        `);
                        $(".contact-requests-badge").addClass("d-none").text("0");
                    }
                });
            })
            .catch(error => {
                console.error("Failed to reject contact request:", error);

                // Reset button state
                $requestCard.find('button').prop('disabled', false);
                $requestCard.find('.reject-request-btn').html(`
                    <i class="bi bi-x-circle me-1"></i> Decline
                `);

                showNotification("Failed to decline request. Please try again.", "error");
            });
    },

    loadContactRequestsCount: function() {
        API.getPendingContactRequestsCount()
            .then(data => {
                const count = data.count || 0;
                if (count > 0) {
                    $(".contact-requests-badge").removeClass("d-none").text(count);
                } else {
                    $(".contact-requests-badge").addClass("d-none").text("0");
                }
            })
            .catch(error => {
                console.error("Failed to load contact requests count:", error);
                $(".contact-requests-badge").addClass("d-none");
            });
    }
};