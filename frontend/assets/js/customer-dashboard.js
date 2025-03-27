$(document).ready(function () {
    loadUserData();
    loadDashboardData();
    setupEventHandlers();
    loadSectionFromUrlHash();
});

// Setting up event handling
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

    // Booking filter
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

    // Handle URL hash changes
    window.addEventListener('hashchange', function () {
        loadSectionFromUrlHash();
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

        loadBookingsPage(page, statusMapping[status] || "");
    });
}

// Loading user data
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
            window.userData = data;
        })
        .catch(error => {
            console.error("Failed to load user data:", error);
            $("#userName").text("Customer");
        });
}

// Loading Dashboard Data
function loadDashboardData() {
    $("#activeBookingsCount, #completedSessionsCount, #messagesCount").text("...");
    $("#recentBookingsTable, #recommendedPhotographers").html(`
        <div class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading data...</span>
        </div>
    `);

    Promise.all([
        loadDashboardCounts(),
        loadRecentBookings(),
        loadRecommendedPhotographers()
    ])
        .then(() => {
            console.log("loaded successfully");
        })
        .catch(error => {
            console.error(error);
            showNotification("Dashboard data couldn't be loaded", "warning");
        });
}

// Loading counts
function loadDashboardCounts() {
    const activeBookingsPromise = API.request("/bookings/count?status=active");
    const completedBookingsPromise = API.request("/bookings/count?status=completed");
    const messagesPromise = API.request("/messages/count?unread=true");

    return Promise.all([
        activeBookingsPromise.then(data => {
            $("#activeBookingsCount").text(data.count);
        }).catch(() => $("#activeBookingsCount").text("0")),

        completedBookingsPromise.then(data => {
            $("#completedSessionsCount").text(data.count);
        }).catch(() => $("#completedSessionsCount").text("0")),

        messagesPromise.then(data => {
            $("#messagesCount").text(data.count);
            if (data.count > 0) {
                $(".message-badge").removeClass("d-none").text(data.count);
            } else {
                $(".message-badge").addClass("d-none");
            }
        }).catch(() => {
            $("#messagesCount").text("0");
            $(".message-badge").addClass("d-none");
        })
    ]);
}

// Load Recent Bookings
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

    return API.request("/bookings?limit=5&sort=date_desc")
        .then(data => {
            if (!data.bookings || data.bookings.length === 0) {
                $("#recentBookingsTable").html(`
                    <tr>
                        <td colspan="5" class="text-center">No bookings found</td>
                    </tr>
                `);
                return;
            }

            const rows = data.bookings.map(booking => {
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
                `;
            }).join('');

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

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ?
        text.substring(0, maxLength) + '...' :
        text;
}

// Loading Recommended Photographers
function loadRecommendedPhotographers() {
    $("#recommendedPhotographers").html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading recommendations...</p>
        </div>
    `);

    return API.request("/photographers/recommended?limit=3")
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

            const cards = data.photographers.map(photographer => `
                <div class="col-md-4 mb-4">
                    <div class="card recommended-card">
                        <div class="recommended-badge">${photographer.specialization || 'Photographer'}</div>
                        <img src="${photographer.image || '../../assets/images/default-photographer.jpg'}" 
                             class="card-img-top recommended-image" alt="${photographer.name}">
                        <div class="card-body">
                            <h5 class="card-title">${photographer.name}</h5>
                            <div class="mb-2">
                                ${generateStarRating(photographer.rating)}
                                <small class="ms-1">(${photographer.rating})</small>
                            </div>
                            <p class="card-text small">${photographer.bio ? truncateText(photographer.bio, 80) : 'Professional photographer on LensLink'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="text-primary">From €${photographer.starting_price}/hr</span>
                                <a href="../../pages/photographer-detail.html?id=${photographer.id}" 
                                   class="btn btn-sm btn-outline-primary">View Profile</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

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

// Show bookings section with specific status
function showBookingsSection(status = "all") {
    $(".nav-link").removeClass("active");
    $('[data-section="bookings"]').addClass("active");
    $(".dashboard-section").addClass("d-none");
    $("#bookingsSection").removeClass("d-none");

    // Update active filter status
    $(".dropdown-item[data-filter]").removeClass("active");
    $(".dropdown-item[data-filter='" + status + "']").addClass("active");

    // Load bookings with status
    filterBookings(status);

    // Update URL hash for direct linking
    window.location.hash = "bookings:" + status;
}

// Filter bookings by status
function filterBookings(filter) {
    const statusMapping = {
        "all": "",
        "active": "confirmed",
        "pending": "pending",
        "completed": "completed",
        "cancelled": "cancelled"
    };

    const status = statusMapping[filter] || "";
    loadBookings(status);
}

// Search bookings
function searchBookings(query) {
    if (!query || query.trim() === "") {
        const status = $(".dropdown-item[data-filter].active").data("filter") || "all";
        filterBookings(status);
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
            displayBookings(data.bookings);
            updatePagination(data.pagination);
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
}

// Load bookings data
function loadBookings(status = "", page = 1) {
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
            displayBookings(data.bookings);
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

// Display bookings list
function displayBookings(bookings) {
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
        openBookingDetailsModal(bookingId);
    });
}

// Load specific page section from URL hash
function loadSectionFromUrlHash() {
    const hash = window.location.hash;
    if (!hash) return;

    // Handle #bookings:active format
    if (hash.startsWith('#bookings:')) {
        const status = hash.split(':')[1];
        showBookingsSection(status);
    }
    // Handle other regular section hashes
    else if (hash.startsWith('#')) {
        const section = hash.substring(1);
        $(".nav-link").removeClass("active");
        $(`[data-section="${section}"]`).addClass("active");
        $(".dashboard-section").addClass("d-none");
        $(`#${section}Section`).removeClass("d-none");

        $(document).trigger(`section:${section}`);
    }
}

// Load specific page of bookings
function loadBookingsPage(page, status = "") {
    loadBookings(status, page);
}

// Update pagination controls
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

    // Get current active filter
    const activeFilter = $(".dropdown-item[data-filter].active").data("filter") || "all";
    const statusMapping = {
        "all": "",
        "active": "confirmed",
        "pending": "pending",
        "completed": "completed",
        "cancelled": "cancelled"
    };
    const status = statusMapping[activeFilter] || "";

    // Bind page click events
    $("#bookingsPagination .page-link").click(function (e) {
        e.preventDefault();
        if ($(this).parent().hasClass('disabled')) {
            return;
        }

        const page = $(this).data('page');
        loadBookingsPage(page, status);
    });
}

// Open booking details modal
function openBookingDetailsModal(bookingId) {
    $("#bookingDetailsModal .modal-body").html(`
        <div class="text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading booking details...</p>
        </div>
    `);

    $("#bookingDetailsModal .modal-footer").hide();

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

// Update booking details modal content
function updateBookingDetailsModal(booking) {
    const photographerName = booking.photographer.user ? booking.photographer.user.name : booking.photographer.name;
    const photographerImage = booking.photographer.image || '../../assets/images/default-photographer.jpg';

    $("#bookingPhotographerImage").attr("src", photographerImage);
    $("#bookingPhotographerName").text(photographerName);
    $("#bookingServiceName").text(booking.service.name);
    $("#bookingStatus").html(`
        <span class="badge ${getStatusBadgeClass(booking.status)}">
            ${capitalizeFirstLetter(booking.status)}
        </span>
    `);

    $("#bookingDate").text(formatDate(booking.booking_date));
    $("#bookingTime").text(booking.start_time + (booking.end_time ? ` - ${booking.end_time}` : ''));
    $("#bookingLocation").text(booking.location || 'Not specified');
    $("#bookingPrice").text(`€${booking.total_amount}`);

    $("#bookingServiceDescription").text(booking.service.description || 'No description available');

    // Service features
    if (booking.service.features && booking.service.features.length > 0) {
        const featuresList = booking.service.features
            .map(feature => `<li><i class="bi bi-check text-success me-2"></i>${feature}</li>`)
            .join('');
        $("#bookingServiceFeatures").html(`<ul class="list-unstyled">${featuresList}</ul>`);
    } else {
        $("#bookingServiceFeatures").html('<p class="text-muted">No features listed</p>');
    }

    // Notes
    $("#bookingNotes").text(booking.notes || 'No additional notes');

    // Enable/disable buttons based on booking status
    if (booking.status === 'completed' || booking.status === 'cancelled') {
        $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', true);
    } else {
        $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', false);
    }
}

// Setup booking modal buttons
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

// Cancel booking
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

// Placeholder functions - implementation depends on your specific requirements
function loadMessages() {
    // Implementation for loading messages
}

function showMessagesSection() {
    // Implementation for showing messages section
}

function openNewMessageModal() {
    // Implementation for opening new message modal
}

function sendNewMessage() {
    // Implementation for sending new message
}

function sendMessage() {
    // Implementation for sending message in conversation
}

function createOrOpenConversation(photographerId) {
    // Implementation for creating or opening conversation
}

function loadSavedPhotographers() {
    // Implementation for loading saved photographers
}

function loadDetailedUserData() {
    // Implementation for loading detailed user data
}

function loadSettings() {
    // Implementation for loading settings
}

function openEditProfileModal() {
    // Implementation for opening edit profile modal
}

function saveProfileChanges() {
    // Implementation for saving profile changes
}