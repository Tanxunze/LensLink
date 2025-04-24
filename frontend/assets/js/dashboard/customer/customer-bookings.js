const CustomerBookings = {
    init: function() {
        this.setupEventHandlers();
    },

    setupEventHandlers: function() {
        // Booking filter
        $(".dropdown-item[data-filter]").click(function (e) {
            e.preventDefault();
            const filter = $(this).data("filter");
            CustomerBookings.filterBookings(filter);

            $(".dropdown-item[data-filter]").removeClass("active");
            $(this).addClass("active");
        });

        // Booking Search
        $("#bookingSearchBtn").click(function () {
            CustomerBookings.searchBookings($("#bookingSearchInput").val());
        });

        $("#bookingSearchInput").on("keyup", function (e) {
            if (e.key === "Enter") {
                CustomerBookings.searchBookings($(this).val());
            }
        });

        // Pagination click events
        $(document).on("click", "#bookingsPagination .page-link", function (e) {
            e.preventDefault();
            if ($(this).parent().hasClass('disabled')) {
                return;
            }

            const page = $(this).data('page');
            const status = $(".dropdown-item[data-filter].active").data("filter") || "all";
            const statusMapping = {
                "all": "",
                "active": "confirmed",
                "pending": "pending",
                "completed": "completed",
                "cancelled": "cancelled"
            };

            CustomerBookings.loadBookingsPage(page, statusMapping[status] || "");
        });

        // Reschedule form submission
        $("#submitRescheduleBtn").click(function() {
            const bookingId = $("#rescheduleBookingId").val();
            const newDate = $("#rescheduleDate").val();
            const startTime = $("#rescheduleStartTime").val();
            const endTime = $("#rescheduleEndTime").val();
            const notes = $("#rescheduleNotes").val();

            if (!newDate || !startTime) {
                showNotification("Please fill in all required fields", "warning");
                return;
            }

            CustomerBookings.rescheduleBooking(bookingId, newDate, startTime, endTime, notes);
        });
    },

    showBookingsSection: function(status = "all") {
        $(".nav-link").removeClass("active");
        $('[data-section="bookings"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#bookingsSection").removeClass("d-none");

        // Update active filter status
        $(".dropdown-item[data-filter]").removeClass("active");
        $(".dropdown-item[data-filter='" + status + "']").addClass("active");

        // Load bookings with status
        this.filterBookings(status);

        // Update URL hash for direct linking
        window.location.hash = "bookings:" + status;
    },

    filterBookings: function(filter) {
        const statusMapping = {
            "all": "",
            "active": "confirmed",
            "pending": "pending",
            "completed": "completed",
            "cancelled": "cancelled"
        };

        const status = statusMapping[filter] || "";
        this.loadBookings(status);
    },

    searchBookings: function(query) {
        if (!query || query.trim() === "") {
            const status = $(".dropdown-item[data-filter].active").data("filter") || "all";
            this.filterBookings(status);
            return;
        }

        // Show loading state
        $("#bookingsTable").html(`
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-2">Searching for "${query}"...</span>
                </td>
            </tr>
        `);

        // Clear pagination
        $("#bookingsPagination").empty();

        // Use API class for search
        API.getBookings({ search: query })
            .then(data => {
                if (!data.bookings || data.bookings.length === 0) {
                    $("#bookingsTable").html(`
                        <tr>
                            <td colspan="8" class="text-center">No bookings found matching "${query}"</td>
                        </tr>
                    `);
                    return;
                }

                // Display search results
                this.displayBookings(data.bookings);
                this.updatePagination(data.pagination);
            })
            .catch(error => {
                console.error("Search failed:", error);
                $("#bookingsTable").html(`
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            Search failed. Please try again.
                        </td>
                    </tr>
                `);
            });
    },

    loadBookings: function(status = "", page = 1) {
        // Show loading state
        $("#bookingsTable").html(`
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading bookings...</p>
                </td>
            </tr>
        `);

        // Clear pagination
        $("#bookingsPagination").empty();

        // Build query parameters
        const params = {
            page: page,
            limit: 10,
            sort_field: 'booking_date',
            sort_order: 'desc'
        };

        if (status) {
            params.status = status;
        }

        // Use API class to get bookings
        API.getBookings(params)
            .then(data => {
                if (!data.bookings || data.bookings.length === 0) {
                    $("#bookingsTable").html(`
                        <tr>
                            <td colspan="8" class="text-center">No bookings found</td>
                        </tr>
                    `);
                    return;
                }

                // Display bookings list
                this.displayBookings(data.bookings);
                this.updatePagination(data.pagination);
            })
            .catch(error => {
                console.error("Failed to load bookings:", error);
                $("#bookingsTable").html(`
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            Failed to load bookings. Please try again.
                        </td>
                    </tr>
                `);
            });
    },

    displayBookings: function(bookings) {
        const rows = bookings.map(booking => {
            const photographerName = booking.photographer.user ? booking.photographer.user.name : booking.photographer.name;
            const photographerId = booking.photographer.id;

            return `
                <tr>
                    <td>
                        <a href="../../pages/photographer-detail.html?id=${photographerId}">
                            ${photographerName}
                        </a>
                    </td>
                    <td>${booking.service.name}</td>
                    <td>${formatDate(booking.booking_date)}</td>
                    <td>${booking.start_time}${booking.end_time ? ` - ${booking.end_time}` : ''}</td>
                    <td>${booking.location || 'Not specified'}</td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(booking.status)}">
                            ${capitalizeFirstLetter(booking.status)}
                        </span>
                    </td>
                    <td>€${booking.total_amount}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary viewBookingBtn" data-id="${booking.id}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        $("#bookingsTable").html(rows);

        // Bind booking details view event
        $(".viewBookingBtn").click(function () {
            const bookingId = $(this).data("id");
            CustomerBookings.openBookingDetailsModal(bookingId);
        });
    },

    loadBookingsPage: function(page, status = "") {
        this.loadBookings(status, page);
    },

    updatePagination: function(pagination) {
        if (!pagination || pagination.total_pages <= 1) {
            $("#bookingsPagination").empty();
            return;
        }

        let paginationHtml = `
            <li class="page-item ${pagination.current_page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${pagination.current_page - 1}">Previous</a>
            </li>
        `;

        // Calculate page range
        const startPage = Math.max(1, pagination.current_page - 2);
        const endPage = Math.min(pagination.total_pages, startPage + 4);

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        paginationHtml += `
            <li class="page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${pagination.current_page + 1}">Next</a>
            </li>
        `;

        $("#bookingsPagination").html(paginationHtml);
    },

    openBookingDetailsModal: function(bookingId) {
        $("#bookingDetailsModal .modal-body").html(`
            <div class="text-center py-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading booking details...</p>
            </div>
        `);

        $("#bookingDetailsModal .modal-footer").hide();

        try {
            const modalElement = document.getElementById('bookingDetailsModal');
            const bookingModal = new bootstrap.Modal(modalElement);
            bookingModal.show();
        } catch (err) {
            console.error("Error showing modal:", err);
            alert("Could not open booking details. Please try again.");
            return;
        }

        fetch(`${CONFIG.API.BASE_URL}/bookings/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load booking details');
                }
                return response.json();
            })
            .then(booking => {
                try {
                    this.updateBookingDetailsModal(booking);
                    $("#bookingDetailsModal .modal-footer").show();
                    this.setupBookingModalButtons(booking);

                } catch (err) {
                    console.error("Error updating modal:", err);
                    $("#bookingDetailsModal .modal-body").html(`
                    <div class="alert alert-danger">
                        An error occurred while displaying booking details.
                    </div>
                `);
                }
            })
            .catch(error => {
                console.error("Failed to load booking details:", error);
                $("#bookingDetailsModal .modal-body").html(`
                <div class="alert alert-danger">
                    Failed to load booking details. Please try again.
                </div>
            `);
            });
    },

    updateBookingDetailsModal: function(booking) {
        try {
            const photographerName = booking.photographer.user.name || 'Unknown';
            const photographerImage = booking.photographer.user.profile_image || '../../assets/images/default-photographer.jpg';
            const serviceName = booking.service.name || 'Unknown service';
            const serviceDescription = booking.service.description || 'No description available';
            let htmlContent = `
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <img src="${photographerImage}" alt="Photographer" class="img-fluid rounded" id="bookingPhotographerImage">
                    </div>
                    <div class="col-md-8">
                        <h4 id="bookingPhotographerName">${photographerName}</h4>
                        <p class="text-muted" id="bookingServiceName">${serviceName}</p>
                        <div id="bookingStatus" class="mb-3">
                            <span class="badge ${getStatusBadgeClass(booking.status)}">
                                ${capitalizeFirstLetter(booking.status)}
                            </span>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>Date:</strong> <span id="bookingDate">${formatDate(booking.booking_date)}</span></p>
                                <p><strong>Time:</strong> <span id="bookingTime">${booking.start_time}${booking.end_time ? ` - ${booking.end_time}` : ''}</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Location:</strong> <span id="bookingLocation">${booking.location || 'Not specified'}</span></p>
                                <p><strong>Price:</strong> <span id="bookingPrice">€${booking.total_amount}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="mb-3">
                    <h5>Service Details</h5>
                    <p id="bookingServiceDescription">${serviceDescription}</p>
                </div>
                <div class="mb-3" id="bookingServiceFeatures">
                    <p class="text-muted">Service includes professional photography as described above.</p>
                </div>
                <div class="mb-3">
                    <h5>Notes</h5>
                    <p id="bookingNotes">${booking.notes || 'No additional notes'}</p>
                </div>
            `;

            $("#bookingDetailsModal .modal-body").html(htmlContent);

            return true;
        } catch (err) {
            console.error("Error in updateBookingDetailsModal:", err);
            $("#bookingDetailsModal .modal-body").html(`
                <div class="alert alert-danger">
                    Error displaying booking details: ${err.message}
                </div>
            `);
            return false;
        }
    },

    setupBookingModalButtons: function(booking) {
        try {
            $("#messagePhotographerBtn").off('click').on('click', function () {
                try {
                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
                    if (modalInstance) {
                        modalInstance.hide();
                    }

                    $(".nav-link").removeClass("active");
                    $('[data-section="messages"]').addClass("active");
                    $(".dashboard-section").addClass("d-none");
                    $("#messagesSection").removeClass("d-none");

                    if (booking.photographer && booking.photographer.id) {
                        CustomerMessages.createOrOpenConversation(booking.photographer.id);
                    } else {
                        console.warn("photographer ID missing");
                        showNotification("Message feature will be available soon", "info");
                    }
                } catch (err) {
                    console.error("Error in message button handler:", err);
                    showNotification("Could not open messaging interface", "error");
                }
            });

            $("#bookingRescheduleBtn").off('click').on('click', function () {
                CustomerBookings.openRescheduleModal(booking);
            });

            $("#bookingCancelBtn").off('click').on('click', function () {
                if (confirm("Are you sure you want to cancel this booking?")) {
                    CustomerBookings.cancelBooking(booking.id);
                }
            });

            if (booking.status === 'completed' || booking.status === 'cancelled') {
                $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', true);
            } else {
                $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', false);
            }

            return true;
        } catch (error) {
            console.error("Error setting up booking modal buttons:", error);
            return false;
        }
    },

    openRescheduleModal: function(booking) {
        try {
            // Close the details modal first
            const detailsModalInstance = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
            if (detailsModalInstance) {
                detailsModalInstance.hide();
            }

            // Set initial values in the reschedule form
            $("#rescheduleBookingId").val(booking.id);

            // Use current booking values as default
            const bookingDate = new Date(booking.booking_date);
            const formattedDate = bookingDate.toISOString().split('T')[0];
            $("#rescheduleDate").val(formattedDate);
            $("#rescheduleStartTime").val(booking.start_time);
            if (booking.end_time) {
                $("#rescheduleEndTime").val(booking.end_time);
            } else {
                $("#rescheduleEndTime").val("");
            }
            $("#rescheduleNotes").val("");

            // Open the reschedule modal
            const rescheduleModal = new bootstrap.Modal(document.getElementById('rescheduleBookingModal'));
            rescheduleModal.show();
        } catch (error) {
            console.error("Error opening reschedule modal:", error);
            showNotification("Could not open reschedule form. Please try again.", "error");
        }
    },

    rescheduleBooking: function(bookingId, newDate, startTime, endTime, notes) {
        // Prepare request data
        const requestData = {
            booking_date: newDate,
            start_time: startTime,
            notes: notes
        };

        if (endTime) {
            requestData.end_time = endTime;
        }

        // Show loading state
        $("#submitRescheduleBtn").prop("disabled", true).html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processing...
        `);

        // Send request to API
        fetch(`${CONFIG.API.BASE_URL}/bookings/${bookingId}/reschedule`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to reschedule booking');
                }
                return response.json();
            })
            .then(data => {
                // Close the modal
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('rescheduleBookingModal'));
                if (modalInstance) {
                    modalInstance.hide();
                }

                // Show success notification
                showNotification("Booking rescheduled successfully", "success");

                // Refresh dashboard data
                CustomerDashboardData.loadAllData();

                // If bookings section is visible, reload it
                if ($("#bookingsSection").is(":visible")) {
                    this.loadBookings();
                }
            })
            .catch(error => {
                console.error("Failed to reschedule booking:", error);
                showNotification("Failed to reschedule booking. Please try again.", "error");
            })
            .finally(() => {
                // Reset button state
                $("#submitRescheduleBtn").prop("disabled", false).html("Reschedule");
            });
    },

    cancelBooking: function(bookingId) {
        fetch(`${CONFIG.API.BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to cancel booking');
                }
                return response.json();
            })
            .then(data => {
                bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal')).hide();
                showNotification("Booking cancelled successfully", "success");
                CustomerDashboardData.loadAllData();
                if ($("#bookingsSection").is(":visible")) {
                    this.loadBookings();
                }
            })
            .catch(error => {
                console.error("Failed to cancel booking:", error);
                showNotification("Failed to cancel booking. Please try again.", "error");
            });
    }
};