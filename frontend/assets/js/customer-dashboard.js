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

    $("#profileImageUpload").on("change", function (e) {
        if ($(this).data("direct-upload") === "true") {
            if (this.files && this.files[0]) {
                $("#profileImage").css("opacity", "0.5");
                $(".profile-image-container .overlay").append(
                    '<div class="upload-spinner"><div class="spinner-border spinner-border-sm text-light" role="status"></div></div>'
                );

                const formData = new FormData();
                formData.append("image", this.files[0]);

                API.updateProfileImage(formData)
                    .then(response => {
                        if (response.user && response.user.profile_image) {
                            $("#profileImage").attr("src", response.user.profile_image);
                            $("#previewProfileImage").attr("src", response.user.profile_image);
                        }
                        showNotification("Updated successfully", "success");
                    })
                    .catch(error => {
                        console.error("Upload failed:", error);
                        showNotification("Upload failed", "error");
                    })
                    .finally(() => {
                        $("#profileImage").css("opacity", "1");
                        $(".profile-image-container .overlay .upload-spinner").remove();
                        $(this).val("");
                    });
            }
        } else {
            if (this.files && this.files[0]) {
                previewImage(this.files[0], "previewProfileImage");
            }
        }

        $(this).data("direct-upload", "false");
    });

    $("#changeProfileImageBtn").click(function () {
        $("#profileImageUpload").data("direct-upload", "true").click();
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

    // $(document).on("section:settings", function () {
    //     loadSettings();
    // });

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

    $(document).ready(function () {
        initPasswordChangeFeature();
    });

    $("#markAsReadBtn").click(function(e) {
        e.preventDefault();
        const conversationId = $("#sendMessageForm").data("conversation-id");
        const conversationType = $("#sendMessageForm").data("conversation-type");

        if (!conversationId) return;

        if (conversationType === 'customer') {
            markCustomerMessagesAsRead(conversationId);
        } else {
            markMessagesAsRead(conversationId);
        }

        showNotification("Messages marked as read", "success");
    });

    $("#viewPhotographerProfileBtn").click(function(e) {
        e.preventDefault();
        const conversationId = $("#sendMessageForm").data("conversation-id");
        const conversation = window.conversationsData.find(c => c.id == conversationId);

        if (conversation && conversation.photographer && conversation.photographer.id) {
            window.open(`../../pages/photographer-detail.html?id=${conversation.photographer.id}`, '_blank');
        } else {
            showNotification("Could not find photographer profile", "warning");
        }
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
    const contactRequestsPromise = API.getPendingContactRequestsCount();

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
        }),

        contactRequestsPromise.then(data => {
            if (data.count > 0) {
                $(".contact-requests-badge").removeClass("d-none").text(data.count);
            } else {
                $(".contact-requests-badge").addClass("d-none");
            }
        }).catch(() => {
            $(".contact-requests-badge").addClass("d-none");
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
    $("#conversationMenu").addClass("d-none");
    loadPendingContactRequests();

    Promise.all([
        API.getConversations().catch(error => {
            console.error("Failed to load photographer conversations:", error);
            return { length: 0 };
        }),
        API.getCustomerConversations().catch(error => {
            console.error("Failed to load customer conversations:", error);
            return { conversations: [] };
        })
    ])
        .then(([photographerConversations, customerData]) => {
            const photogConvs = Array.isArray(photographerConversations) ? photographerConversations : [];
            const customerConvs = customerData && Array.isArray(customerData.conversations)
                ? customerData.conversations.map(conv => {
                    if (!conv.id && conv.conversation_id) {
                        conv.id = conv.conversation_id;
                    }
                    return {...conv, type: 'customer'};
                }) : [];

            const allConversations = [
                ...photogConvs.map(conv => ({...conv, type: 'photographer'})),
                ...customerConvs.map(conv => ({...conv, type: 'customer'}))
            ];

            allConversations.sort((a, b) => {
                const timeA = a.last_message_time || a.updated_at || a.created_at;
                const timeB = b.last_message_time || b.updated_at || b.created_at;
                return new Date(timeB) - new Date(timeA);
            });

            window.conversationsData = allConversations;

            if (allConversations.length === 0) {
                $("#conversationsList").html(`
                <div class="p-3 text-center">
                    <p class="text-muted">No conversations yet</p>
                    <button class="btn btn-sm btn-outline-primary" id="startNewConversationBtn">
                        Start a new conversation
                    </button>
                </div>
            `);

                $("#startNewConversationBtn").click(function() {
                    openNewMessageModal();
                });
                return;
            }

            const conversationsHtml = allConversations.map(conversation => {
                let otherPartyName, otherPartyImage, unreadCount;

                if (conversation.type === 'photographer') {
                    const photographer = conversation.photographer || {};
                    const user = photographer.user || {};
                    otherPartyName = user.name || 'Photographer';
                    otherPartyImage = user.profile_image || '../../assets/images/default-photographer.jpg';
                    unreadCount = conversation.unread_count || 0;
                } else {
                    const participant = conversation.participant || {};
                    otherPartyName = participant.name || 'User';
                    otherPartyImage = participant.profile_image || '../../assets/images/default-avatar.jpg';
                    unreadCount = conversation.unread_count || 0;
                }

                let lastMessageTime, lastMessageText;
                if (conversation.type === 'photographer') {
                    lastMessageTime = formatDate(conversation.last_message_time || conversation.created_at);
                    lastMessageText = conversation.last_message || 'No messages yet';
                } else {
                    lastMessageTime = formatDate(conversation.latest_message?.time || conversation.created_at);
                    lastMessageText = conversation.latest_message?.content || 'No messages yet';
                }

                const unreadClass = unreadCount > 0 ? 'fw-bold' : '';
                const unreadBadge = unreadCount > 0
                    ? `<span class="badge bg-danger rounded-pill ms-2">${unreadCount}</span>`
                    : '';

                return `
                <a href="#" class="list-group-item list-group-item-action conversation-item ${unreadClass}" 
                   data-id="${conversation.id}"
                   data-type="${conversation.type}"
                   data-other-name="${otherPartyName}">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="${otherPartyImage}" class="rounded-circle me-2" width="32" height="32" alt="${otherPartyName}">
                            <h6 class="mb-1">${otherPartyName} ${unreadBadge}</h6>
                        </div>
                        <small class="text-muted">${lastMessageTime}</small>
                    </div>
                    <p class="mb-1 text-truncate ps-4">${lastMessageText}</p>
                    ${conversation.type === 'customer' ?
                    '<div class="mt-1 ps-4"><span class="badge bg-info">Customer</span></div>' : ''}
                </a>
            `;
            }).join('');

            $("#conversationsList").html(conversationsHtml);

            $(".conversation-item").click(function(e) {
                e.preventDefault();
                const conversationId = $(this).data("id");
                const conversationType = $(this).data("type");
                const otherName = $(this).data("other-name");

                if (!conversationId) {
                    console.error("Missing conversation ID");
                    return;
                }
                $("#sendMessageForm").data("conversation-id", conversationId);
                $("#sendMessageForm").data("conversation-type", conversationType);
                $("#conversationTitle").text(otherName);
                $(this).removeClass("fw-bold")
                    .find(".badge").remove();

                $(".conversation-item").removeClass("active");
                $(this).addClass("active");

                $("#conversationMenu").removeClass("d-none");

                if (conversationType === 'customer') {
                    loadCustomerConversation(conversationId);
                } else {
                    loadConversation(conversationId);
                    markMessagesAsRead(conversationId);
                }
            });
        })
        .catch(error => {
            console.error("Failed to load conversations:", error);
            $("#conversationsList").html(`
            <div class="alert alert-danger m-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Failed to load conversations. Please try again.
            </div>
        `);
        });
}

// Load customer conversation messages
function loadCustomerConversation(conversationId) {
    if (!conversationId) {
        console.error("Invalid conversation ID");
        $("#messagesContainer").html(`
            <div class="text-center p-5">
                <i class="bi bi-exclamation-triangle text-warning display-4"></i>
                <p class="mt-3">Could not load this conversation</p>
            </div>
        `);
        return;
    }

    $("#messagesContainer").html(`
        <div class="text-center p-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading messages...</p>
        </div>
    `);

    API.getCustomerConversationMessages(conversationId)
        .then(data => {
            $("#messageInputContainer").removeClass("d-none");

            const messages = data.messages || [];
            const otherParticipant = data.participant || {};

            $("#conversationTitle").text(otherParticipant.name || "Conversation");
            $("#conversationMenu").removeClass("d-none");

            if (!messages.length) {
                $("#messagesContainer").html(`
                    <div class="text-center p-5">
                        <p class="text-muted">No messages yet</p>
                        <p class="text-muted small">Start the conversation by sending a message below</p>
                    </div>
                `);
                return;
            }

            const messagesHtml = messages.map(message => {
                const isCurrentUser = message.is_mine;
                const alignClass = isCurrentUser ? 'justify-content-end' : 'justify-content-start';
                const bgColor = isCurrentUser ? '#007bff' : '#f1f1f1';
                const textColor = isCurrentUser ? '#fff' : '#000';

                const time = formatTime(message.created_at);
                const date = formatDate(message.created_at);

                return `
                    <div class="d-flex ${alignClass} mb-3">
                        <div class="message-bubble" style="background: ${bgColor}; color: ${textColor}; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                            <div class="message-content">
                                <p class="mb-0">${message.message}</p>
                                <small class="d-block text-${isCurrentUser ? 'end' : 'start'} mt-1" style="opacity: 0.8; color: ${textColor} !important;">
                                    ${date} ${time}
                                </small>
                            </div>
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

            $("#messageInputContainer").removeClass("d-none");
            markCustomerMessagesAsRead(conversationId);
            setTimeout(scrollToBottom, 100);
        })
        .catch(error => {
            console.error("Failed to load customer conversation:", error);
            $("#messagesContainer").html(`
                <div class="alert alert-danger m-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load messages. Please try again.
                </div>
            `);
        });
}

function loadConversation(conversationId) {
    const activeContact = $(".conversation-item.active");
    if (activeContact.length > 0) {
        const contactName = activeContact.find("h6").text().trim().replace(/New$/, '');
        $("#conversationTitle").text(contactName);
    }

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
                $("#messagesContainer").html(`
                    <div class="text-center p-5">
                        <p class="text-muted">No messages yet</p>
                        <p class="text-muted small">Start the conversation by sending a message below</p>
                    </div>
                `);
            } else {
                const currentUserId = parseInt(localStorage.getItem("userId") || "0");

                const messagesHtml = messages.map(message => {
                    const isCurrentUser = message.sender_id === currentUserId;
                    const alignClass = isCurrentUser ? 'justify-content-end' : 'justify-content-start';
                    const bgColor = isCurrentUser ? '#007bff' : '#f1f1f1';
                    const textColor = isCurrentUser ? '#fff' : '#000';

                    const time = message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    const date = message.created_at ? formatDate(message.created_at) : '';

                    return `
                        <div class="d-flex ${alignClass} mb-3">
                            <div class="message-bubble" style="background: ${bgColor}; color: ${textColor}; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                                <div class="message-content">
                                    <p class="mb-0">${message.message}</p>
                                    <small class="d-block text-${isCurrentUser ? 'end' : 'start'} mt-1" style="opacity: 0.8; color: ${textColor} !important;">
                                        ${date} ${time}
                                    </small>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                $("#messagesContainer").html(`
                    <div class="messages-wrapper d-flex flex-column">
                        ${messagesHtml}
                    </div>
                `);

                setTimeout(scrollToBottom, 100);
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
    const conversationType = $("#sendMessageForm").data("conversation-type") || 'photographer';
    const message = $("#messageInput").val().trim();

    if (!conversationId) {
        showNotification("Conversation not selected", "warning");
        return;
    }

    if (!message) {
        return;
    }

    $("#messageInput").prop("disabled", true);

    const currentTime = new Date().toISOString();
    const formattedTime = formatTime(currentTime);
    const formattedDate = formatDate(currentTime);

    const newMessageHtml = `
        <div class="d-flex justify-content-end mb-3">
            <div class="message-bubble" style="background: #007bff; color: #fff; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                <div class="message-content">
                    <p class="mb-0">${message}</p>
                    <small class="d-block text-end mt-1" style="opacity: 0.8; color: #fff !important;">
                        ${formattedDate} ${formattedTime}
                    </small>
                </div>
            </div>
        </div>
    `;

    $(".messages-wrapper").append(newMessageHtml);

    scrollToBottom();

    if (conversationType === 'customer') {
        API.sendCustomerMessage({
            conversation_id: conversationId,
            message: message
        })
            .then(response => {
                console.log("Message sent successfully:", response);
                $("#messageInput").val("").prop("disabled", false).focus();
            })
            .catch(error => {
                console.error("Failed to send message:", error);
                $("#messageInput").prop("disabled", false);
                showNotification("Failed to send message. Please try again.", "error");
            });
    } else {
        const conversation = window.conversationsData.find(c => c.id == conversationId && c.type === 'photographer');

        if (!conversation || !conversation.photographer || !conversation.photographer.id) {
            showNotification("Invalid conversation data", "error");
            $("#messageInput").prop("disabled", false);
            return;
        }

        const messageData = {
            photographer_id: conversation.photographer.id,
            message: message
        };

        API.sendMessage(messageData)
            .then(response => {
                console.log("Message sent successfully:", response);
                $("#messageInput").val("").prop("disabled", false).focus();
            })
            .catch(error => {
                console.error("Failed to send message:", error);
                $("#messageInput").prop("disabled", false);
                showNotification("Failed to send message. Please try again.", "error");
            });
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById("messagesContainer");
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    const messagesWrapper = document.querySelector(".messages-wrapper");
    if (messagesWrapper) {
        messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
    }

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
                $("#previewProfileImage").attr("src", data.profile_image);
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

            if (response.user && response.user.profile_image) {
                $("#profileImage").attr("src", response.user.profile_image);
            }

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

function initPasswordChangeFeature() {
    // Listen for clicks on the change password link
    $("#changePasswordLink").on("click", function (e) {
        e.preventDefault();
        console.log("Change Password link clicked");

        // If accessing settings first, make sure settings section is shown
        if (!$("#settingsSection").is(":visible")) {
            $(".nav-link").removeClass("active");
            $('[data-section="settings"]').addClass("active");
            $(".dashboard-section").addClass("d-none");
            $("#settingsSection").removeClass("d-none");
        }

        // Show the change password modal
        showPasswordModal();
    });

    // Password visibility toggle
    $(document).on("click", ".toggle-password", function () {
        togglePasswordVisibility($(this));
    });

    // Password strength meter
    $(document).on("input", "#newPassword", function () {
        updatePasswordStrength($(this).val());
    });

    // Password submit handler
    $("#submitPasswordBtn").on("click", function () {
        submitPasswordChange();
    });

    // Reset form when modal is closed
    $('#changePasswordModal').on('hidden.bs.modal', function () {
        resetPasswordForm();
    });

    // Handle direct access via URL hash
    handleDirectPasswordAccess();
}

function showPasswordModal() {
    const changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    changePasswordModal.show();
}

function togglePasswordVisibility(toggleButton) {
    const targetId = toggleButton.data("target");
    const input = $(`#${targetId}`);
    const icon = toggleButton.find("i");

    if (input.attr("type") === "password") {
        input.attr("type", "text");
        icon.removeClass("bi-eye").addClass("bi-eye-slash");
    } else {
        input.attr("type", "password");
        icon.removeClass("bi-eye-slash").addClass("bi-eye");
    }
}

function updatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.match(/[a-z]+/)) strength += 20;
    if (password.match(/[A-Z]+/)) strength += 20;
    if (password.match(/[0-9]+/)) strength += 20;
    if (password.match(/[^a-zA-Z0-9]+/)) strength += 20;

    const progressBar = $("#passwordStrength");
    progressBar.css("width", `${strength}%`);

    if (strength < 40) {
        progressBar.removeClass("bg-warning bg-success").addClass("bg-danger");
    } else if (strength < 80) {
        progressBar.removeClass("bg-danger bg-success").addClass("bg-warning");
    } else {
        progressBar.removeClass("bg-danger bg-warning").addClass("bg-success");
    }
}

function submitPasswordChange() {
    console.log("Password change button clicked");

    // Get form values
    const currentPassword = $("#currentPassword").val();
    const newPassword = $("#newPassword").val();
    const confirmPassword = $("#confirmNewPassword").val();

    // Client-side validation
    if (!validatePasswordForm(currentPassword, newPassword, confirmPassword)) {
        return;
    }

    // Show loading state
    const submitButton = $("#submitPasswordBtn");
    setButtonLoading(submitButton, true);

    // Submit the password change
    sendPasswordChangeRequest(currentPassword, newPassword, confirmPassword)
        .then(handlePasswordChangeSuccess)
        .catch(handlePasswordChangeError)
        .finally(() => {
            setButtonLoading(submitButton, false);
        });
}

function validatePasswordForm(currentPassword, newPassword, confirmPassword) {
    if (!currentPassword) {
        showNotification("Please enter your current password", "warning");
        return false;
    }

    if (!newPassword) {
        showNotification("Please enter a new password", "warning");
        return false;
    }

    if (newPassword.length < 8) {
        showNotification("New password must be at least 8 characters long", "warning");
        return false;
    }

    if (newPassword !== confirmPassword) {
        showNotification("New password and confirmation do not match", "warning");
        return false;
    }

    return true;
}

function sendPasswordChangeRequest(currentPassword, newPassword, confirmPassword) {
    return fetch(`${CONFIG.API.BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword
        })
    })
        .then(response => {
            console.log("Password change API response status:", response.status);

            if (!response.ok) {
                return response.json().then(data => {
                    throw { status: response.status, data: data };
                });
            }
            return response.json();
        });
}

function handlePasswordChangeSuccess(data) {
    console.log("Password changed successfully");
    resetPasswordForm();

    // Hide the modal
    bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();

    // Show success notification
    showNotification("Password changed successfully", "success");
}

function handlePasswordChangeError(error) {
    console.error("Password change error:", error);

    let errorMessage = "Failed to change password";

    if (error.status === 422) {
        if (error.data && error.data.errors) {
            if (error.data.errors.current_password) {
                errorMessage = "Current password is incorrect";
            } else if (error.data.errors.new_password) {
                errorMessage = error.data.errors.new_password[0] || "Invalid new password format";
            }
        } else if (error.data && error.data.message) {
            errorMessage = error.data.message;
        }
    } else if (error.status === 401) {
        errorMessage = "Authentication failed, please log in again";
        setTimeout(() => {
            window.location.href = "../../pages/auth/login.html";
        }, 2000);
    }

    showNotification(errorMessage, "error");
}

function resetPasswordForm() {
    $("#passwordChangeForm")[0].reset();
    $("#passwordStrength").css("width", "0%");
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.prop("disabled", true).html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Updating...
        `);
    } else {
        button.prop("disabled", false).text("Change Password");
    }
}

function handleDirectPasswordAccess() {
    if (window.location.hash === "#settings:password") {
        setTimeout(() => {
            console.log("Direct password settings access detected");
            $(".nav-link[data-section='settings']").click();
            setTimeout(() => {
                $("#changePasswordLink").click();
            }, 300);
        }, 300);
    }
}

// Load pending contact requests
function loadPendingContactRequests() {
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
                acceptContactRequest(requestId, senderName);
            });

            $(".reject-request-btn").on("click", function() {
                const requestId = $(this).data('id');
                rejectContactRequest(requestId);
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
}

// Format relative time
function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
        return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
        return 'just now';
    }
}

// Accept contact request
function acceptContactRequest(requestId, senderName) {
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
            loadMessages();
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
}

// Reject contact request
function rejectContactRequest(requestId) {
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
}

// Load contact requests count
function loadContactRequestsCount() {
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

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function markCustomerMessagesAsRead(conversationId) {
    API.markCustomerMessagesAsRead(conversationId)
        .then(() => {
            $(`.conversation-item[data-id="${conversationId}"]`).removeClass("fw-bold")
                .find(".badge").remove();
            loadDashboardCounts();
        })
        .catch(error => {
            console.error("Failed to mark customer messages as read:", error);
        });
}