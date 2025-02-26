$(document).ready(function () {
    loadUserData();
    loadDashboardData();
    setupEventHandlers();
    loadSectionFromUrlHash();
});

/**
 * Setting up event handling
 */
function setupEventHandlers() {
    // Dashboard Refresh Button
    $("#refreshDashboardBtn").click(function () {
        loadDashboardData();
        showNotification("Dashboard data refreshed", "info");
    });

    // Profile Button
    $("#viewProfileLink, #editProfileLink").click(function (e) {
        e.preventDefault();
        $(".nav-link").removeClass("active");
        $('[data-section="profile"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#profileSection").removeClass("d-none");
        // if the link is for editing profile, open the modal
        if (this.id === "editProfileLink") {
            openEditProfileModal();
        }
    });

    // Quick Links
    $("#viewActiveBookingsLink").click(function (e) {
        e.preventDefault();
        showBookingsSection("active");
    });

    $("#viewCompletedSessionsLink").click(function (e) {
        e.preventDefault();
        showBookingsSection("completed");
    });

    $("#viewMessagesLink").click(function (e) {
        e.preventDefault();
        showMessagesSection();
    });

    $("#viewAllBookingsBtn").click(function (e) {
        e.preventDefault();
        showBookingsSection("all");
    });

    $("#newMessageBtn").click(function (e) {
        e.preventDefault();
        openNewMessageModal();
    });

    $("#editProfileBtn").click(function (e) {
        e.preventDefault();
        openEditProfileModal();
    });

    $("#uploadProfileImageBtn").click(function () {
        $("#profileImageUpload").click();
    });

    $("#profileImageUpload").change(function () {
        if (this.files && this.files[0]) {
            previewImage(this.files[0], "previewProfileImage");
        }
    });

    $("#saveProfileBtn").click(function () {
        saveProfileChanges();
    });

    $("#sendNewMessageBtn").click(function () {
        sendNewMessage();
    });

    $("#sendMessageForm").submit(function (e) {
        e.preventDefault();
        sendMessage();
    });

    // booking filter
    $(".dropdown-item[data-filter]").click(function (e) {
        e.preventDefault();
        const filter = $(this).data("filter");
        filterBookings(filter);

        $(".dropdown-item[data-filter]").removeClass("active");
        $(this).addClass("active");
    });

    // Booking Search
    $("#bookingSearchBtn").click(function () {
        searchBookings($("#bookingSearchInput").val());
    });

    $("#bookingSearchInput").on("keyup", function (e) {
        if (e.key === "Enter") {
            searchBookings($(this).val());
        }
    });

    // Partial Load Event Listening
    $(document).on("section:bookings", function () {
        loadBookings();
    });

    $(document).on("section:messages", function () {
        loadMessages();
    });

    $(document).on("section:savedPhotographers", function () {
        loadSavedPhotographers();
    });

    $(document).on("section:profile", function () {
        loadDetailedUserData();
    });

    $(document).on("section:settings", function () {
        loadSettings();
    });
}

/**
 * loading user data
 */
function loadUserData() {
    $("#userName").text("Loading...");

    fetch(`${CONFIG.API.BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load user data');
            }
            return response.json();
        })
        .then(data => {
            $("#userName").text(data.name);
            //cache
            window.userData = data;
        })
        .catch(error => {
            console.error("Failed to load user data:", error);
            $("#userName").text("Customer");
        });
}

/**
 * Loading Dashboard Data
 */
function loadDashboardData() {
    loadDashboardCounts();
    loadRecentBookings();
    loadRecommendedPhotographers();
}

/**
 * loading counts
 */
function loadDashboardCounts() {
    fetch(`${CONFIG.API.BASE_URL}/bookings/count?status=active`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            $("#activeBookingsCount").text(data.count);
        })
        .catch(error => {
            console.error("Failed to load active bookings count:", error);
            $("#activeBookingsCount").text("0");
        });

    fetch(`${CONFIG.API.BASE_URL}/bookings/count?status=completed`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            $("#completedSessionsCount").text(data.count);
        })
        .catch(error => {
            console.error("Failed to load completed sessions count:", error);
            $("#completedSessionsCount").text("0");
        });

    fetch(`${CONFIG.API.BASE_URL}/messages/count?unread=true`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            $("#messagesCount").text(data.count);
            if (data.count > 0) {
                $(".message-badge").removeClass("d-none").text(data.count);
            } else {
                $(".message-badge").addClass("d-none");
            }
        })
        .catch(error => {
            console.error("Failed to load messages count:", error);
            $("#messagesCount").text("0");
            $(".message-badge").addClass("d-none");
        });
}

/**
 * Load Recent Bookings
 */
function loadRecentBookings() {
    $("#recentBookingsTable").html(`
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading bookings...</span>
            </td>
        </tr>
    `);

    fetch(`${CONFIG.API.BASE_URL}/bookings?limit=5&sort=date_desc`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load recent bookings');
            }
            return response.json();
        })
        .then(data => {
            // check if there are bookings
            if (!data.bookings || data.bookings.length === 0) {
                $("#recentBookingsTable").html(`
                <tr>
                    <td colspan="5" class="text-center">No bookings found</td>
                </tr>
            `);
                return;
            }

            // generate booking table rows
            const rows = data.bookings.map(booking => `
            <tr>
                <td>
                    <a href="../../pages/photographer-detail.html?id=${booking.photographer.id}">
                        ${booking.photographer.name}
                    </a>
                </td>
                <td>${booking.service.name}</td>
                <td>${formatDate(booking.booking_date)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(booking.status)}">
                        ${capitalizeFirstLetter(booking.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary viewBookingBtn" data-id="${booking.id}">
                        View
                    </button>
                </td>
            </tr>
        `).join('');

            $("#recentBookingsTable").html(rows);

            $(".viewBookingBtn").click(function () {
                const bookingId = $(this).data("id");
                openBookingDetailsModal(bookingId);
            });
        })
        .catch(error => {
            console.error("Failed to load recent bookings:", error);
            $("#recentBookingsTable").html(`
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Failed to load bookings. Please try again.
                </td>
            </tr>
        `);
        });
}

/**
 * Loading Recommended Photographers
 */
function loadRecommendedPhotographers() {
    // status
    $("#recommendedPhotographers").html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading recommendations...</p>
        </div>
    `);

    fetch(`${CONFIG.API.BASE_URL}/photographers/recommended?limit=3`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load recommended photographers');
            }
            return response.json();
        })
        .then(data => {
            if (!data.photographers || data.photographers.length === 0) {
                $("#recommendedPhotographers").html(`
                <div class="col-12">
                    <div class="alert alert-info">
                        No recommendations available at this time. Try browsing our photographers!
                    </div>
                </div>
            `);
                return;
            }

            // generate recommend cards
            const cards = data.photographers.map(photographer => `
            <div class="col-md-4 mb-4">
                <div class="card recommended-card">
                    <div class="recommended-badge">${photographer.specialization}</div>
                    <img src="${photographer.image || '../../assets/images/default-photographer.jpg'}" class="card-img-top recommended-image" alt="${photographer.name}">
                    <div class="card-body">
                        <h5 class="card-title">${photographer.name}</h5>
                        <div class="mb-2">
                            ${generateStarRating(photographer.rating)}
                            <small class="ms-1">(${photographer.rating})</small>
                        </div>
                        <p class="card-text small">${photographer.bio ? photographer.bio.substring(0, 80) + '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-primary">From €${photographer.starting_price}/hr</span>
                            <a href="../../pages/photographer-detail.html?id=${photographer.id}" class="btn btn-sm btn-outline-primary">View Profile</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

            //update cards
            $("#recommendedPhotographers").html(cards);
        })
        .catch(error => {
            console.error("Failed to load recommended photographers:", error);
            $("#recommendedPhotographers").html(`
            <div class="col-12">
                <div class="alert alert-danger">
                    Failed to load recommendations. Please try again later.
                </div>
            </div>
        `);
        });
}

/**
 * Open the appointment details modal box
 * @param {number} bookingId - id
 */
function openBookingDetailsModal(bookingId) {
    // status
    $("#bookingDetailsModal .modal-body").html(`
        <div class="text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading booking details...</p>
        </div>
    `);

    $("#bookingDetailsModal .modal-footer").hide();

    // display the modal
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
    bookingModal.show();

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
            updateBookingDetailsModal(booking);
            $("#bookingDetailsModal .modal-footer").show();
            setupBookingModalButtons(booking);
        })
        .catch(error => {
            console.error("Failed to load booking details:", error);
            $("#bookingDetailsModal .modal-body").html(`
            <div class="alert alert-danger">
                Failed to load booking details. Please try again.
            </div>
        `);
        });
}

/**
 * Updated booking details modal box content
 * @param {Object} booking - booking data
 */
function updateBookingDetailsModal(booking) {
    $("#bookingPhotographerImage").attr("src", booking.photographer.image || '../../assets/images/default-photographer.jpg');
    $("#bookingPhotographerName").text(booking.photographer.name);
    $("#bookingServiceName").text(booking.service.name);
    $("#bookingStatus").html(`
        <span class="badge ${getStatusBadgeClass(booking.status)}">
            ${capitalizeFirstLetter(booking.status)}
        </span>
    `);
    // details
    $("#bookingDate").text(formatDate(booking.booking_date));
    $("#bookingTime").text(booking.start_time + (booking.end_time ? ` - ${booking.end_time}` : ''));
    $("#bookingLocation").text(booking.location || 'Not specified');
    $("#bookingPrice").text(`€${booking.total_amount}`);

    $("#bookingServiceDescription").text(booking.service.description || 'No description available');

    // service features
    if (booking.service.features && booking.service.features.length > 0) {
        const featuresList = booking.service.features
            .map(feature => `<li><i class="bi bi-check text-success me-2"></i>${feature}</li>`)
            .join('');
        $("#bookingServiceFeatures").html(`<ul class="list-unstyled">${featuresList}</ul>`);
    } else {
        $("#bookingServiceFeatures").html('<p class="text-muted">No features listed</p>');
    }

    // notes
    $("#bookingNotes").text(booking.notes || 'No additional notes');

    // Enable/disable buttons according to booking status
    if (booking.status === 'completed' || booking.status === 'cancelled') {
        $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', true);
    } else {
        $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', false);
    }
}

/**
 * Booking modal box button event handling
 * @param {Object} booking - booking data
 */
function setupBookingModalButtons(booking) {
    $("#messagePhotographerBtn").off('click').on('click', function () {
        bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal')).hide();

        $(".nav-link").removeClass("active");
        $('[data-section="messages"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#messagesSection").removeClass("d-none");

        createOrOpenConversation(booking.photographer.id);
    });

    $("#bookingRescheduleBtn").off('click').on('click', function () {
        alert(`Reschedule functionality for booking ID ${booking.id} will be implemented soon.`);
    });

    $("#bookingCancelBtn").off('click').on('click', function () {
        if (confirm("Are you sure you want to cancel this booking?")) {
            cancelBooking(booking.id);
        }
    });
}

/**
 * Booking cancellation
 * @param {number} bookingId - id
 */
function cancelBooking(bookingId) {
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
            loadDashboardData();
            if ($("#bookingsSection").is(":visible")) {
                loadBookings();
            }
        })
        .catch(error => {
            console.error("Failed to cancel booking:", error);
            showNotification("Failed to cancel booking. Please try again.", "error");
        });
}

/**
 * Load all booings
 */
function loadBookings() {
    // status
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

    // Clear Pagination
    $("#bookingsPagination").empty();

    fetch(`${CONFIG.API.BASE_URL}/bookings?page=1&limit=10`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load bookings');
            }
            return response.json();
        })
        .then(data => {
            if (!data.bookings || data.bookings.length === 0) {
                $("#bookingsTable").html(`
                <tr>
                    <td colspan="8" class="text-center">No bookings found</td>
                </tr>
            `);
                return;
            }

            // generate booking table rows
            const rows = data.bookings.map(booking => `
            <tr>
                <td>
                    <a href="../../pages/photographer-detail.html?id=${booking.photographer.id}">
                        ${booking.photographer.name}
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
        `).join('');

            $("#bookingsTable").html(rows);

            $(".viewBookingBtn").click(function () {
                const bookingId = $(this).data("id");
                openBookingDetailsModal(bookingId);
            });

            updatePagination(data.pagination);
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
}

/**
 * Updating the paging controller
 * @param {Object} pagination - data
 */
function updatePagination(pagination) {
    if (!pagination || pagination.total_pages <= 1) {
        $("#bookingsPagination").empty();
        return;
    }

    let paginationHtml = `
        <li class="page-item ${pagination.current_page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${pagination.current_page - 1}">Previous</a>
        </li>
    `;

    // calc page range
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.total_pages, startPage + 4);

    // add page numbers
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
    $("#bookingsPagination .page-link").click(function (e) {
        e.preventDefault();
        if ($(this).parent().hasClass('disabled')) {
            return;
        }

        const page = $(this).data('page');
        loadBookingsPage(page);
    });
}

/**
 * Load booking for a specified page
 * @param {number} page - page number
 */
function loadBookingsPage(page) {
    $("#bookingsTable").html(`
        <tr>
            <td colspan="8" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading page ${page}...</span>
            </td>
        </tr>
    `);

    fetch(`${CONFIG.API.BASE_URL}/bookings?page=${page}&limit=10`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load page ${page}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.bookings || data.bookings.length === 0) {
                $("#bookingsTable").html(`
                <tr>
                    <td colspan="8" class="text-center">No bookings found</td>
                </tr>
            `);
                return;
            }

            const rows = data.bookings.map(booking => `
            <tr>
                <td>
                    <a href="../../pages/photographer-detail.html?id=${booking.photographer.id}">
                        ${booking.photographer.name}
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
        `).join('');

            $("#bookingsTable").html(rows);
            $(".viewBookingBtn").click(function () {
                const bookingId = $(this).data("id");
                openBookingDetailsModal(bookingId);
            });

            updatePagination(data.pagination);
        })
        .catch(error => {
            console.error(`Failed to load page ${page}:`, error);
            $("#bookingsTable").html(`
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Failed to load page ${page}. Please try again.
                </td>
            </tr>
        `);
        });
}

// Todo: other loading functions