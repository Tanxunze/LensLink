$(document).ready(function () {
    loadUserData();
    loadDashboardData();
    setupEventHandlers();
    loadSectionFromUrlHash();
    $(document).on('hidden.bs.modal', '.modal', function () {
        console.log('Modal closed - cleaning up');//debug
        if ($('.modal.show').length === 0) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('overflow', '');
            $('body').css('padding-right', '');
        }
    });
});

// Setting up event handling
function setupEventHandlers() {
    // Universal section navigation handler
    $(".nav-link[data-section]").click(function (e) {
        e.preventDefault();
        const section = $(this).data("section");

        // if (section === "bookings" || section === "messages") {
        //     return;
        // }

        $(".nav-link").removeClass("active");
        $(this).addClass("active");
        $(".dashboard-section").addClass("d-none");
        $(`#${section}Section`).removeClass("d-none");

        $(document).trigger(`section:${section}`);

        window.location.hash = section;
    });

    $("#refreshDashboardBtn").click(function () {
        loadDashboardData();
        showNotification("Dashboard data refreshed", "info");
    });

    $("#viewProfileLink, #editProfileLink").click(function (e) {
        e.preventDefault();
        $(".nav-link").removeClass("active");
        $('[data-section="profile"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#profileSection").removeClass("d-none");

        if (this.id === "editProfileLink") {
            openEditProfileModal();
        }
        loadDetailedUserData();

        window.location.hash = "profile";
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

    // Message management
    $("#newMessageBtn").click(function (e) {
        e.preventDefault();
        openNewMessageModal();
    });

    $("#sendNewMessageBtn").click(function () {
        sendNewMessage();
    });

    $("#sendMessageForm").submit(function (e) {
        e.preventDefault();
        sendMessage();
    });

    // Profile management
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

    $("#changeProfileImageBtn").click(function () {
        $("#profileImageUpload").click();
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

    // Section Load Event Listeners
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

    // Handle specialized format: #bookings:active
    if (hash.startsWith('#bookings:')) {
        const status = hash.split(':')[1];
        showBookingsSection(status);
        return;
    }

    if (hash.startsWith('#')) {
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

    try {
        const modalElement = document.getElementById('bookingDetailsModal');
        console.log("Modal element exists:", !!modalElement);
        const bookingModal = new bootstrap.Modal(modalElement);
        bookingModal.show();
    } catch (err) {
        console.error("Error showing modal:", err);
        alert("Could not open booking details. Please try again.");
        return;
    }

    console.log("Fetching booking details, ID:", bookingId);
    console.log("Request URL:", `${CONFIG.API.BASE_URL}/bookings/${bookingId}`);

    fetch(`${CONFIG.API.BASE_URL}/bookings/${bookingId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log("API response status:", response.status);
            if (!response.ok) {
                throw new Error('Failed to load booking details');
            }
            return response.json();
        })
        .then(booking => {
            console.log("Booking data received successfully");
            console.log("Booking object:", booking);

            try {
                updateBookingDetailsModal(booking);
                $("#bookingDetailsModal .modal-footer").show();
                setupBookingModalButtons(booking);

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
}

function updateBookingDetailsModal(booking) {
    console.log("Modal body exists:", $("#bookingDetailsModal .modal-body").length);
    console.log("About to update modal body...");

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
        console.log("Modal body updated with jQuery");

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
}

function setupBookingModalButtons(booking) {
    console.log("Setting up button handlers");

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

                if (typeof createOrOpenConversation === 'function' && booking.photographer && booking.photographer.id) {
                    createOrOpenConversation(booking.photographer.id);
                } else {
                    console.warn("createOrOpenConversation function not available or photographer ID missing");
                    showNotification("Message feature will be available soon", "info");
                }
            } catch (err) {
                console.error("Error in message button handler:", err);
                showNotification("Could not open messaging interface", "error");
            }
        });

        $("#bookingRescheduleBtn").off('click').on('click', function () {
            alert(`Reschedule functionality for booking ID ${booking.id} will be implemented soon.`);
        });

        $("#bookingCancelBtn").off('click').on('click', function () {
            if (confirm("Are you sure you want to cancel this booking?")) {
                cancelBooking(booking.id);
            }
        });

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', true);
        } else {
            $("#bookingRescheduleBtn, #bookingCancelBtn").prop('disabled', false);
        }

        console.log("Button handlers set up");
        return true;
    } catch (error) {
        console.error("Error setting up booking modal buttons:", error);
        return false;
    }
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

function showMessagesSection() {
    $(".nav-link").removeClass("active");
    $('[data-section="messages"]').addClass("active");
    $(".dashboard-section").addClass("d-none");
    $("#messagesSection").removeClass("d-none");
    loadMessages();
    window.location.hash = "messages";
}

function loadMessages() {
    $("#conversationsList").html(`
        <div class="text-center p-3">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading conversations...</span>
        </div>
    `);

    $("#conversationTitle").text("Select a conversation");
    $("#messagesContainer").html(`
        <div class="text-center p-5">
            <i class="bi bi-chat-dots display-4 text-muted"></i>
            <p class="mt-3">Select a conversation to view messages</p>
        </div>
    `);
    $("#messageInputContainer").addClass("d-none");

    API.getConversations()
        .then(data => {
            window.conversationsData = data;

            if (!data || data.length === 0) {
                $("#conversationsList").html(`
                    <div class="p-3 text-center">
                        <p class="text-muted">No conversations yet</p>
                        <button class="btn btn-sm btn-outline-primary" id="startNewConversationBtn">
                            Start a new conversation
                        </button>
                    </div>
                `);

                $("#startNewConversationBtn").click(function () {
                    openNewMessageModal();
                });
                return;
            }

            const conversationsHtml = data.map(conversation => {
                const otherParty = conversation.photographer && conversation.photographer.user
                    ? conversation.photographer.user
                    : (conversation.customer || {});

                const unreadClass = conversation.unread_count > 0 ? 'fw-bold' : '';
                const unreadBadge = conversation.unread_count > 0
                    ? `<span class="badge bg-primary rounded-pill ms-2">${conversation.unread_count}</span>`
                    : '';

                const lastMsgTime = conversation.last_message_time
                    ? formatDate(conversation.last_message_time)
                    : formatDate(conversation.created_at);

                return `
                    <a href="#" class="list-group-item list-group-item-action conversation-item ${unreadClass}" 
                       data-id="${conversation.id}"
                       data-photographer-id="${conversation.photographer ? conversation.photographer.id : ''}"
                       data-other-name="${otherParty.name || 'User'}">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1 conversation-name">${otherParty.name || 'User'}</h6>
                            <small class="conversation-time">${lastMsgTime}</small>
                        </div>
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <p class="mb-1 text-truncate conversation-preview">${conversation.last_message || conversation.subject || 'No messages yet'}</p>
                            ${unreadBadge}
                        </div>
                    </a>
                `;
            }).join('');

            $("#conversationsList").html(conversationsHtml);
            $(".conversation-item").click(function (e) {
                e.preventDefault();
                const conversationId = $(this).data("id");
                const photographerId = $(this).data("photographer-id");
                const otherName = $(this).data("other-name");

                $("#sendMessageForm").data("conversation-id", conversationId);
                $("#sendMessageForm").data("photographer-id", photographerId);
                $("#conversationTitle").text(otherName);

                loadConversation(conversationId);
                $(".conversation-item").removeClass("active");
                $(this).addClass("active");
            });
        })
        .catch(error => {
            console.error("Failed to load conversations:", error);
            $("#conversationsList").html(`
                <div class="alert alert-danger m-3">
                    Failed to load conversations. Please try again.
                </div>
            `);
        });
}

function loadConversation(conversationId) {
    $("#messagesContainer").html(`
        <div class="text-center p-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading messages...</p>
        </div>
    `);

    API.getConversationMessages(conversationId)
        .then(data => {
            $("#sendMessageForm").data("conversation-id", conversationId);
            const messages = data.data || [];

            if (messages.length === 0) {
                $("#conversationTitle").text("New conversation");
                $("#messagesContainer").html(`
                    <div class="text-center p-5">
                        <p class="text-muted">No messages yet</p>
                        <p class="text-muted small">Start the conversation by sending a message below</p>
                    </div>
                `);
            } else {
                const firstMessage = messages[0];
                const senderId = firstMessage.sender_id;
                const currentUserId = parseInt(localStorage.getItem("userId") || "0");

                if (firstMessage.sender && senderId !== currentUserId) {
                    $("#conversationTitle").text(firstMessage.sender.name || "Conversation");
                } else if (messages.length > 1 && messages[1].sender) {
                    $("#conversationTitle").text(messages[1].sender.name || "Conversation");
                } else {
                    $("#conversationTitle").text("Conversation");
                }

                const messagesHtml = messages.map(message => {
                    const isCurrentUser = message.sender_id === currentUserId;
                    const messageClass = isCurrentUser ? 'message-sent' : 'message-received';
                    const alignClass = isCurrentUser ? 'align-self-end' : 'align-self-start';
                    const bgClass = isCurrentUser ? 'bg-primary text-white' : 'bg-light';

                    const time = message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    const date = message.created_at ? formatDate(message.created_at) : '';

                    return `
                        <div class="message ${messageClass} ${alignClass}">
                            <div class="message-bubble ${bgClass} p-2 rounded mb-2">
                                ${message.message}
                            </div>
                            <div class="message-info small text-muted">
                                ${date} ${time}
                            </div>
                        </div>
                    `;
                }).join('');

                $("#messagesContainer").html(`
                    <div class="messages-wrapper d-flex flex-column">
                        ${messagesHtml}
                    </div>
                `);

                const messagesContainer = document.getElementById("messagesContainer");
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            $("#messageInputContainer").removeClass("d-none");
            markMessagesAsRead(conversationId);
        })
        .catch(error => {
            console.error("Failed to load conversation:", error);
            $("#messagesContainer").html(`
                <div class="alert alert-danger m-3">
                    Failed to load messages. Please try again.
                </div>
            `);
        });
}

function sendMessage() {
    const conversationId = $("#sendMessageForm").data("conversation-id");
    const message = $("#messageInput").val().trim();

    if (!conversationId) {
        showNotification("No conversation selected", "error");
        return;
    }

    if (!message) {
        return;
    }

    const replyData = {
        conversation_id: conversationId,
        message: message
    };

    $("#messageInput").prop("disabled", true);

    API.replyToConversation(replyData)
        .then(data => {
            $("#messageInput").val("").prop("disabled", false).focus();
            loadConversation(conversationId);
        })
        .catch(error => {
            console.error("Failed to send message:", error);
            $("#messageInput").prop("disabled", false);
            showNotification("Failed to send message. Please try again.", "error");
        });
}

function openNewMessageModal() {
    $("#newMessageForm")[0].reset();
    $("#messageRecipient").html(`<option value="">Loading photographers...</option>`);

    API.getPhotographers()
        .then(data => {
            if (!data.data || data.data.length === 0) {
                $("#messageRecipient").html(`<option value="">No photographers available</option>`);
                return;
            }

            const options = data.data.map(photographer =>
                `<option value="${photographer.id}">${photographer.name}</option>`
            ).join('');

            $("#messageRecipient").html(`
                <option value="">Select a photographer</option>
                ${options}
            `);
        })
        .catch(error => {
            console.error("Failed to load photographers:", error);
            $("#messageRecipient").html(`<option value="">Error loading photographers</option>`);
        });

    const newMessageModal = new bootstrap.Modal(document.getElementById('newMessageModal'));
    newMessageModal.show();
}

function sendMessage() {
    const conversationId = $("#sendMessageForm").data("conversation-id");
    const message = $("#messageInput").val().trim();

    if (!conversationId) {
        showNotification("No conversation selected", "error");
        return;
    }

    if (!message) {
        return;
    }

    let conversation = null;
    const activeConversationElement = $(".conversation-item.active");
    if (activeConversationElement.length) {
        const activeConversationId = activeConversationElement.data("id");
        if (activeConversationId == conversationId) {
            if (window.conversationsData) {
                conversation = window.conversationsData.find(c => c.id == conversationId);
            }
        }
    }

    if (!conversation || !conversation.photographer || !conversation.photographer.id) {
        showNotification("Could not determine photographer information", "error");
        return;
    }

    const messageData = {
        photographer_id: conversation.photographer.id,
        message: message,
        subject: conversation.subject || "Reply to conversation"
    };

    $("#messageInput").prop("disabled", true);

    fetch(`${CONFIG.API.BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            return response.json();
        })
        .then(data => {
            $("#messageInput").val("").prop("disabled", false).focus();
            loadConversation(conversationId);
        })
        .catch(error => {
            console.error("Failed to send message:", error);
            $("#messageInput").prop("disabled", false);
            showNotification("Failed to send message. Please try again.", "error");
        });
}

function createOrOpenConversation(photographerId) {
    if (!photographerId) {
        showNotification("Invalid photographer ID", "error");
        return;
    }

    $(".nav-link").removeClass("active");
    $('[data-section="messages"]').addClass("active");
    $(".dashboard-section").addClass("d-none");
    $("#messagesSection").removeClass("d-none");

    API.getConversations()
        .then(conversations => {
            const conversationList = Array.isArray(conversations) ? conversations : [];

            const existingConversation = conversationList.find(conv => {
                return conv.photographer && conv.photographer.id == photographerId;
            });

            if (existingConversation) {
                setTimeout(() => {
                    $(".conversation-item[data-id='" + existingConversation.id + "']").click();
                }, 500);
                return;
            }
            $("#messageRecipient").val(photographerId);
            $("#messageSubject").val(`Regarding photography services`);
            openNewMessageModal();
        })
        .catch(error => {
            console.error("Failed to check conversations:", error);
            showNotification("Failed to open conversation. Please try again.", "error");

            $("#messageRecipient").val(photographerId);
            $("#messageSubject").val(`Regarding photography services`);
            openNewMessageModal();
        });
}

function markMessagesAsRead(conversationId) {
    API.markMessagesAsRead(conversationId)
        .then(() => {
            $(`.conversation-item[data-id="${conversationId}"]`).removeClass("fw-bold")
                .find(".badge").remove();
            loadDashboardCounts();
        })
        .catch(error => {
            console.error("Failed to mark messages as read:", error);
        });
}

function sendNewMessage() {
    const photographerId = $("#messageRecipient").val();
    const subject = $("#messageSubject").val();
    const message = $("#messageContent").val();

    if (!photographerId) {
        showNotification("Please select photographer", "warning");
        return;
    }

    if (!subject.trim()) {
        showNotification("Please type subject", "warning");
        return;
    }

    if (!message.trim()) {
        showNotification("Please type message", "warning");
        return;
    }

    const messageData = {
        photographer_id: photographerId,
        subject: subject,
        message: message
    };

    $("#sendNewMessageBtn").prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');

    API.sendMessage(messageData)
        .then(response => {
            showNotification("success");
            $("#newMessageForm")[0].reset();
            const newMessageModal = bootstrap.Modal.getInstance(document.getElementById('newMessageModal'));
            newMessageModal.hide();
            loadMessages();
        })
        .catch(error => {
            console.error(error);
            showNotification("error");
        })
        .finally(() => {
            $("#sendNewMessageBtn").prop("disabled", false).html('Send Message');
        });
}

function loadSavedPhotographers() {
    $("#savedPhotographersList").html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading saved photographers...</p>
        </div>
    `);

    API.getSavedPhotographers()
        .then(data => {
            if (!data.photographers || data.photographers.length === 0) {
                $("#savedPhotographersList").html(`
                    <div class="col-12">
                        <div class="alert alert-info">
                            <p class="mb-0">You haven't saved any photographers yet.</p>
                            <p class="mb-0 mt-2">Browse our <a href="../photographers.html" class="alert-link">photographers</a> and save your favorites!</p>
                        </div>
                    </div>
                `);
                return;
            }

            const photographersHTML = data.photographers.map(photographer => {
                const rating = photographer.average_rating || 0;
                const categories = photographer.categories ? photographer.categories.split(',').join(', ') : 'Photographer';

                return `
                    <div class="col-md-4 col-lg-3 mb-4">
                        <div class="card saved-photographer-card">
                            <div class="remove-saved" data-id="${photographer.id}">
                                <i class="bi bi-x-circle"></i>
                            </div>
                            <img src="${photographer.profile_image || '../../assets/images/default-photographer.jpg'}" 
                                 class="card-img-top saved-photographer-image" alt="${photographer.name}">
                            <div class="card-body">
                                <h5 class="card-title">${photographer.name}</h5>
                                <p class="photographer-category">${photographer.specialization || categories}</p>
                                <div class="photographer-rating mb-2">
                                    ${generateStarRating(rating)}
                                    <small class="ms-1">(${rating})</small>
                                </div>
                                <p class="photographer-location">
                                    <i class="bi bi-geo-alt"></i> ${photographer.location || 'Location not specified'}
                                </p>
                                <p class="card-text small">${photographer.bio ? truncateText(photographer.bio, 100) : 'Professional photographer on LensLink'}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="photographer-price">From €${photographer.starting_price || '100'}</span>
                                    <a href="../photographer-detail.html?id=${photographer.id}" 
                                       class="btn btn-sm btn-outline-primary">View Profile</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            $("#savedPhotographersList").html(photographersHTML);
            $(".remove-saved").click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                const photographerId = $(this).data("id");
                removeFromFavorites(photographerId);
            });
        })
        .catch(error => {
            console.error("Failed to load saved photographers:", error);
            $("#savedPhotographersList").html(`
                <div class="col-12">
                    <div class="alert alert-danger">
                        <p>Failed to load your saved photographers. Please try again later.</p>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadSavedPhotographers()">
                            <i class="bi bi-arrow-clockwise"></i> Retry
                        </button>
                    </div>
                </div>
            `);
        });
}

function removeFromFavorites(photographerId) {
    if (!confirm("Are you sure you want to remove this photographer from your favorites?")) {
        return;
    }

    const $card = $(`.remove-saved[data-id="${photographerId}"]`).closest('.col-md-4');
    $card.addClass('opacity-50');
    $(`.remove-saved[data-id="${photographerId}"]`).html(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `);

    API.removeFromFavorites(photographerId)
        .then(response => {
            $card.fadeOut(300, function () {
                $(this).remove();
                if ($("#savedPhotographersList .card").length === 0) {
                    $("#savedPhotographersList").html(`
                        <div class="col-12">
                            <div class="alert alert-info">
                                <p class="mb-0">You haven't saved any photographers yet.</p>
                                <p class="mb-0 mt-2">Browse our <a href="../photographers.html" class="alert-link">photographers</a> and save your favorites!</p>
                            </div>
                        </div>
                    `);
                }

                showNotification("Photographer removed from favorites", "success");
            });
        })
        .catch(error => {
            console.error("Failed to remove from favorites:", error);
            $card.removeClass('opacity-50');
            $(`.remove-saved[data-id="${photographerId}"]`).html(`
                <i class="bi bi-x-circle"></i>
            `);
            showNotification("Failed to remove from favorites. Please try again.", "error");
        });
}

function loadDetailedUserData() {
    $("#profileName, #infoName").text("Loading...");
    $("#profileEmail, #infoEmail").text("loading@example.com");
    // $("#profileImage").attr("src", "../../assets/images/default-avatar.jpg");
    $("#profileImage").attr("src");
    $("#profileMember").text("Member since: Loading...");
    $("#infoPhone").text("Loading...");
    $("#infoAddress").text("Loading...");
    $("#totalBookings").text("0");
    $("#totalReviews").text("0");

    API.getUserDetailedProfile()
        .then(data => {
            localStorage.setItem("userId", data.id);

            $("#profileName, #infoName").text(data.name || "User");
            $("#profileEmail, #infoEmail").text(data.email || "No email provided");

            if (data.profile_image) {
                $("#profileImage").attr("src", data.profile_image);
            }

            const memberSince = new Date(data.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            $("#profileMember").text(`Member since: ${memberSince}`);

            $("#infoPhone").text(data.phone || "Not provided");
            $("#infoAddress").text(data.address || "Not provided");

            $("#totalBookings").text(data.bookings_count || "0");
            $("#totalReviews").text(data.reviews_count || "0");

            $("#editName").val(data.name);
            $("#editEmail").val(data.email);
            $("#editPhone").val(data.phone || "");
            $("#editAddress").val(data.address || "");

            if (data.profile_image) {
                $("#previewProfileImage").attr("src", data.profile_image);
            }
        })
        .catch(error => {
            console.error("Failed to load detailed user data:", error);
            showNotification("Failed to load profile data", "error");
        });
}

function openEditProfileModal() {
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    editProfileModal.show();
}

function previewImage(file, previewElementId) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $(`#${previewElementId}`).attr("src", e.target.result);
    };
    reader.readAsDataURL(file);
}

function saveProfileChanges() {
    const profileData = {
        name: $("#editName").val(),
        email: $("#editEmail").val(),
        phone: $("#editPhone").val(),
        address: $("#editAddress").val()
    };

    $("#saveProfileBtn").prop("disabled", true).html(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Saving...
    `);

    API.updateUserProfile(profileData)
        .then(response => {
            const profileImageInput = document.getElementById("profileImageUpload");
            if (profileImageInput.files && profileImageInput.files[0]) {
                const formData = new FormData();
                formData.append("image", profileImageInput.files[0]);

                return API.updateProfileImage(formData);
            }
            return response;
        })
        .then(response => {
            bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();

            loadDetailedUserData();

            showNotification("Profile updated successfully", "success");
        })
        .catch(error => {
            console.error("Failed to update profile:", error);
            showNotification("Failed to update profile", "error");
        })
        .finally(() => {
            $("#saveProfileBtn").prop("disabled", false).text("Save Changes");
        });
}
