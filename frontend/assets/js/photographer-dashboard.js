// Most of the code can be reused, but I haven't figured out how to decouple it. - Xunze
// All media upload functionality will need to be rewritten at a later date and now only exists locally. - Xunze
/* Note: Please use the following standard comment style for each js function so that it can be read and modified by other contributors. -Xunze
* Description: A brief description of the function.
* Input parameter: @param {type} name - description
* Output parameter: @returns {type} - description
*/
// Global variable to store user's last portfolio tag selection
let lastSelectedCategory = "all";

$(document).ready(function () {
    loadPhotographerData();
    loadDashboardData();
    setupEventHandlers();
    loadSectionFromUrlHash();
    initPasswordChangeFeature();
    loadCategories();

    $('#addPortfolioModal').on('hidden.bs.modal', function () {
        resetPortfolioModal();
    });

    window.addEventListener('hashchange', function () {
        loadSectionFromUrlHash();
    });

    $(document).on('hidden.bs.modal', '.modal', function () {
        console.log('Modal closed - cleaning up');
        if ($('.modal.show').length === 0) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('overflow', '');
            $('body').css('padding-right', '');
        }
    });
});

function setupEventHandlers() {
    $(".nav-link[data-section]").click(function (e) {
        e.preventDefault();
        const section = $(this).data("section");

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
    });

    $("#viewPendingOrdersLink").click(function (e) {
        e.preventDefault();
        showBookingsSection("pending");
    });

    $("#viewActiveOrdersLink").click(function (e) {
        e.preventDefault();
        showBookingsSection("confirmed");
    });

    $("#viewEarningsLink").click(function (e) {
        e.preventDefault();
        // Todo: jump to income statistics?
        alert("Earnings statistics coming soon!");
    });

    $("#viewReviewsLink").click(function (e) {
        e.preventDefault();
        showReviewsSection();
    });

    $("#viewAllBookingsBtn").click(function (e) {
        e.preventDefault();
        showBookingsSection("all");
    });

    $("#viewAllReviewsBtn").click(function (e) {
        e.preventDefault();
        showReviewsSection();
    });

    $("#addPortfolioItemBtn").click(function (e) {
        e.preventDefault();
        openAddPortfolioModal();
    });

    $("#addServiceBtn").click(function (e) {
        e.preventDefault();
        openAddServiceModal();
    });

    $("button[data-category]").click(function () {
        const category = $(this).data("category");
        $("button[data-category]").removeClass("active");
        $(this).addClass("active");
        lastSelectedCategory = category;
        filterPortfolioItems(category);
    });

    $("button[data-view]").click(function () {
        const view = $(this).data("view");

        $("button[data-view]").removeClass("active");
        $(this).addClass("active");

        if (view === "list") {
            $("#bookingsListView").removeClass("d-none");
            $("#bookingsCalendarView").addClass("d-none");
        } else {
            $("#bookingsListView").addClass("d-none");
            $("#bookingsCalendarView").removeClass("d-none");
            if ($("#bookingsCalendar").children().length <= 1) {
                initializeBookingsCalendar();
            }
        }
    });

    $(document).on("click", ".replyBtn", function() {
        const reviewId = $(this).data("id");
        console.log("Opening reply modal for review ID:", reviewId);
        openReviewReplyModal(reviewId);
    });

    $(".dropdown-menu a[data-filter]").click(function (e) {
        e.preventDefault();
        const filterStatus = $(this).data("filter");

        const filterText = $(this).text();
        $(this).closest('.btn-group').find('.dropdown-toggle').html(`<i class="bi bi-filter"></i> ${filterText}`);

        $(".dropdown-menu a[data-filter]").removeClass("active");
        $(this).addClass("active");

        console.log(filterStatus);

        loadBookings(filterStatus);
    })

    // loading event listeners
    $(document).on("section:portfolio", function () {
        loadPortfolio(lastSelectedCategory);

        $("button[data-category]").removeClass("active");
        $(`button[data-category="${lastSelectedCategory}"]`).addClass("active");
    });

    $(document).on("section:bookings", function () {
        loadBookings();
    });

    $(document).on("section:services", function () {
        loadServices();
    });

    $(document).on("section:messages", function () {
        loadMessages();
    });

    $(document).on("section:reviews", function () {
        loadReviews();
    });

    $(document).on("section:profile", function () {
        loadDetailedPhotographerData();
    });

    $(document).on("section:portfolio", function () {
        console.log("Portfolio section activated");
        loadCategories();
        loadPortfolio(lastSelectedCategory);
    });

    // income Time Range drop-down menu
    $(".dropdown-item[data-timeframe]").click(function (e) {
        e.preventDefault();
        const timeframe = $(this).data("timeframe");

        // update text
        let timeframeText = "Last 6 Months";
        switch (timeframe) {
            case 30:
                timeframeText = "Last 30 Days";
                break;
            case 90:
                timeframeText = "Last 3 Months";
                break;
            case 365:
                timeframeText = "Last 12 Months";
                break;
        }
        $("#earningsTimeframeDropdown").text(timeframeText);

        // update active item
        $(".dropdown-item[data-timeframe]").removeClass("active");
        $(this).addClass("active");

        // reload chart
        loadEarningsChart(timeframe);
    });

    $("#portfolioImageBtn").click(function () {
        $("#portfolioImageUpload").click();
    });

    $("#portfolioImageUpload").change(function () {
        if (this.files && this.files[0]) {
            previewImage(this.files[0], "portfolioPreview");
        }
    });

    $("#addFeatureBtn").click(function () {
        addServiceFeatureInput();
    });

    $("#savePortfolioBtn").click(function () {
        savePortfolioItem();
    });

    $("#saveServiceBtn").click(function () {
        saveService();
    });

    $("#submitReplyBtn").click(function () {
        submitReviewReply();
    });

    $(document).on("section:settings", function () {
        initPasswordChangeFeature();
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

    $("#changeProfileImageBtn").click(function () {
        $("#profileImageUpload").data("direct-upload", "true").click();
    });

    $("#profileImageUpload").on("change", function (e) {
        if ($(this).data("direct-upload") === "true") {
            if (this.files && this.files[0]) {
                $("#profileImage").css("opacity", "0.5");
                $(".profile-image-container .overlay").append(
                    '<div class="upload-spinner"><div class="spinner-border spinner-border-sm text-light" role="status"></div></div>'
                );

                uploadProfileImage(this.files[0])
                    .then(response => {
                        if (response.profile_image) {
                            $("#profileImage").attr("src", response.profile_image);
                            $("#previewProfileImage").attr("src", response.profile_image);
                        }
                        showNotification("Profile image updated successfully", "success");
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

    $("#markAsReadBtn").click(function(e) {
        e.preventDefault();
        const conversationId = $("#sendMessageForm").data("conversation-id");
        if (!conversationId) return;

        API.markMessagesAsRead(conversationId)
            .then(() => {
                showNotification("Messages marked as read", "success");
            })
            .catch(error => {
                console.error("Failed to mark messages as read:", error);
                showNotification("Failed to mark messages as read", "error");
            });
    });

    $("#viewClientProfileBtn").click(function(e) {
        e.preventDefault();
        const conversationId = $("#sendMessageForm").data("conversation-id");
        const conversation = window.conversationsData.find(c => c.id == conversationId);

        if (conversation && conversation.customer && conversation.customer.id) {
            
            showNotification("Client profile view is not available", "info");
        } else {
            showNotification("Could not find client information", "warning");
        }
    });

    $("#refreshMessagesBtn").click(function() {
        loadMessages();
        showNotification("Messages refreshed", "info");
    });

    $(document).on("submit", "#sendMessageForm", function(e) {
        e.preventDefault();
        const messageText = $("#messageInput").val().trim();
        const conversationId = $(this).data("conversation-id");

        if (messageText && conversationId) {
            sendMessage(conversationId, messageText);
        }
    });
}

function loadSectionFromUrlHash() {
    const hash = window.location.hash;
    if (!hash) return;

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

function showBookingsSection(status = "all") {
    $(".nav-link").removeClass("active");
    $('[data-section="bookings"]').addClass("active");
    $(".dashboard-section").addClass("d-none");
    $("#bookingsSection").removeClass("d-none");
    $(".dropdown-item[data-filter]").removeClass("active");
    $(".dropdown-item[data-filter='" + status + "']").addClass("active");

    filterBookings(status);
    window.location.hash = "bookings:" + status;
}

function showReviewsSection() {
    $(".nav-link").removeClass("active");
    $('[data-section="reviews"]').addClass("active");
    $(".dashboard-section").addClass("d-none");
    $("#reviewsSection").removeClass("d-none");

    loadReviews();
    $(".replyBtn").click(function (e) {
        const reviewId = $(this).data("id");
        openReviewReplyModal(reviewId);
    });
    // window.location.hash = "reviews";
}

/**
 * Loading photographer data
 */
function loadPhotographerData() {
    $("#photographerName").text("Loading...");

    fetch(`${CONFIG.API.BASE_URL}/photographer/profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load photographer data');
            }
            return response.json();
        })
        .then(data => {
            $("#photographerName").text(data.name);
            window.photographerData = data;
        })
        .catch(error => {
            console.error("Failed to load photographer data:", error);
            $("#photographerName").text("Photographer");
        });

}

/**
 * Loading Dashboard Data
 */
function loadDashboardData() {
    loadDashboardCounts();
    loadEarningsChart(180); // Default display 6 months(180 days)
    loadRecentBookings();
    loadRecentReviews();
}

/**
 * Load Dashboard Count
 */
function loadDashboardCounts() {
    fetch(`${CONFIG.API.BASE_URL}/bookings/count?status=pending`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            $("#pendingOrdersCount").text(data.count);

            // Show notification badge if order is pending
            if (data.count > 0) {
                $(".booking-badge").removeClass("d-none").text(data.count);
            } else {
                $(".booking-badge").addClass("d-none");
            }
        })
        .catch(error => {
            console.error("Failed to load pending orders count:", error);
            $("#pendingOrdersCount").text("0");
            $(".booking-badge").addClass("d-none");
        });

    fetch(`${CONFIG.API.BASE_URL}/bookings/count?status=confirmed`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            $("#activeOrdersCount").text(data.count);
        })
        .catch(error => {
            console.error("Failed to load active orders count:", error);
            $("#activeOrdersCount").text("0");
        });

    fetch(`${CONFIG.API.BASE_URL}/earnings/monthly`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            $("#monthlyEarnings").text(`€${data.amount}`);
        })
        .catch(error => {
            console.error("Failed to load monthly earnings:", error);
            $("#monthlyEarnings").text("€0");
        });

    fetch(`${CONFIG.API.BASE_URL}/reviews/rating`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            $("#overallRating").text(parseFloat(data.rating).toFixed(1));
        })
        .catch(error => {
            console.error("Failed to load overall rating:", error);
            $("#overallRating").text("0.0");
        });
}

/**
 * Load Income Chart
 * @param {number} days - Number of days to display
 */
function loadEarningsChart(days) {
    
    $("#earningsChart").html(`
        <div class="d-flex justify-content-center align-items-center h-100">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);

    fetch(`${CONFIG.API.BASE_URL}/earnings/chart?days=${days}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load earnings data');
            }
            return response.json();
        })
        .then(data => {
            // prepare chart canvas
            $("#earningsChart").html('<canvas id="earningsChartCanvas"></canvas>');

            const chartData = {
                labels: data.labels,
                datasets: [{
                    label: 'Earnings (€)',
                    data: data.values,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    tension: 0.4
                }]
            };

            // create chart
            const ctx = document.getElementById('earningsChartCanvas').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '€' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return '€' + context.raw;
                                }
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error("Failed to load earnings chart:", error);
            $("#earningsChart").html(`
            <div class="alert alert-danger m-3">
                Failed to load earnings data. Please try again.
            </div>
        `);
        });
}

/**
 * Load Recent Bookings
 */
function loadRecentBookings() {
    $("#recentBookingsTable").html(`
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading bookings...</span>
            </td>
        </tr>
    `);

    fetch(`${CONFIG.API.BASE_URL}/photographer/profile/recent-bookings`, {
        method: "POST",
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
            if (!data || data.length === 0) {
                $("#recentBookingsTable").html(`
                <tr>
                    <td colspan="6" class="text-center">No bookings found</td>
                </tr>
            `);
                return;
            }

            const rows = data.map(booking => `
                <tr>
                    <td>${booking.customer_name}</td>
                    <td>${booking.service_name}</td>
                    <td>${formatDate(booking.booking_date)}</td>
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
                        <button class="btn btn-sm btn-outline-success messageClientBtn" data-id="${booking.customer.id}">
                            <i class="bi bi-chat"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            $("#recentBookingsTable").html(rows);

            $(".viewBookingBtn").click(function () {
                const bookingId = $(this).data("id");
                openBookingDetailsModal(bookingId);
            });

            $(".messageClientBtn").click(function () {
                const clientId = $(this).data("id");
                messageClient(clientId);
            });
        })
        .catch(error => {
            console.error("Failed to load recent bookings:", error);
            $("#recentBookingsTable").html(`
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        Failed to load bookings. Please try again.
                    </td>
                </tr>
            `);
        });
}

/**
 * Load Recent Reviews
 */
function loadRecentReviews() {
    $("#recentReviewsContainer").html(`
        <div class="text-center">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading reviews...</span>
        </div>
    `);

    fetch(`${CONFIG.API.BASE_URL}/photographer/profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load recent reviews');
            }
            return response.json();
        })
        .then(data => {
            if (!data.reviews || data.reviews.length === 0) {
                $("#recentReviewsContainer").html(`
                <div class="alert alert-info">
                    You haven't received any reviews yet.
                </div>
            `);
                return;
            }

            const reviewsHtml = data.reviews.map(review => {
                const hasReply = review.reply !== null && review.reply !== '';
                const reviewClass = hasReply ? '' : 'new';

                return `
                <div class="card review-card ${reviewClass} mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="card-title mb-1">${review.title}</h5>
                                <div>
                                    ${generateStarRating(review.rating)}
                                    <small class="text-muted ms-2">${formatDate(review.created_at)}</small>
                                </div>
                            </div>
                            <div>
                                <button class="btn btn-sm ${hasReply ? 'btn-outline-secondary' : 'btn-outline-primary'} replyBtn" data-id="${review.id}">
                                    ${hasReply ? '<i class="bi bi-pencil"></i> Edit Reply' : '<i class="bi bi-reply"></i> Reply'}
                                </button>
                            </div>
                        </div>
                        <p class="card-text">${review.review}</p>
                        <div class="d-flex align-items-center">
                            <img src="${review.customer_image || '../../assets/images/default-avatar.jpg'}" class="rounded-circle me-2" width="30" height="30" alt="${review.customer_name}">
                            <small>${review.customer_name} • ${review.service_type}</small>
                        </div>
                        ${hasReply ? `
                            <div class="review-reply mt-3">
                                <small class="text-muted">Your reply • ${formatDate(review.reply_date)}</small>
                                <p class="mb-0 mt-1">${review.reply}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            }).join('');

            $("#recentReviewsContainer").html(reviewsHtml);

            $(".replyBtn").click(function (e) {
                const reviewId = $(this).data("id");
                openReviewReplyModal(reviewId);
            });
        })
        .catch(error => {
            console.error("Failed to load recent reviews:", error);
            $("#recentReviewsContainer").html(`
            <div class="alert alert-danger">
                Failed to load reviews. Please try again.
            </div>
        `);
        });
}

//Get filtered portfolio information based on category given
function filterPortfolioItems(category) {
    lastSelectedCategory = category;
    loadPortfolio(category);
}

// Get portfolio information
function loadPortfolio(category = 'all') {
    $('#portfolioItems').html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading portfolio...</p>
        </div>
    `);

    const requestData = {
        category: category
    };

    fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load portfolio');
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                $("#portfolioItems").html(`
                    <div class="col-12">
                        <div class="alert alert-info">
                            No Portfolio found. Please try again later.
                        </div>
                    </div>
                `);
                return;
            }

            const portfolioItemHtml = data.map(item => {

                return `
                <div class="col-md-3 mb-4 portfolio-item" data-category="${item.category}">
                    <div class="card h-100">
                        <div class="portfolio-image-container">
                            <img src="${item.image_path}" class="card-img-top" alt="${item.title}">
                            <div class="overlay">
                                <button class="btn btn-sm btn-light view-portfolio-btn me-5" data-id="${item.id}">
                                    <i class="bi bi-eye"></i> View
                                </button>
                                <button class="btn btn-sm btn-light edit-portfolio-btn" data-id="${item.id}">
                                    <i class="bi bi-pencil"></i> Edit
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                            <p class="card-text text-muted small">${formatDate(item.created_at)}</p>
                        </div>
                        <div class="card-footer bg-white">
                            <span class="badge bg-primary">${capitalizeFirstLetter(item.category)}</span>
                            ${item.featured ? '<span class="badge bg-warning ms-1">Featured</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
            }).join('');

            $("#portfolioItems").html(portfolioItemHtml);

            $(".view-portfolio-btn").click(function () {
                const itemId = $(this).data("id");
                viewPortfolioItem(itemId);
            });
            $(".edit-portfolio-btn").click(function () {
                const itemId = $(this).data("id");
                console.log(itemId);
                editPortfolioItem(itemId);
            });
        })
        .catch(error => {
            console.error("Failed to load portfolio:", error);
            $("#portfolioItems").html(`
                <div class="col-12">
                    <div class="alert alert-danger">
                        Failed to load portfolio items. Please try again.
                    </div>
                </div>
            `);
        })
}

function viewPortfolioItem(itemId) {
    console.log("ItemID: ", itemId);
    if (!document.getElementById('portfolioDetailModal')) {
        const modalHtml = `
            <div class="modal fade" id="portfolioDetailModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Portfolio Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p>Loading portfolio details...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioDetailModal'));
    portfolioModal.show();

    const requestData = {
        portfolio_id: itemId
    }

    fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load portfolio details');
            }
            return response.json();
        })
        .then(data => {
            const item = Array.isArray(data) ? data[0] : data;
            const modalBody = document.querySelector('#portfolioDetailModal .modal-body');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-8">
                        <img src="${item.image_path}" class="img-fluid rounded" alt="${item.title}">
                    </div>
                    <div class="col-md-4 text-start">
                        <h4>${item.title}</h4>
                        <div class="mb-3">
                            <span class="badge bg-primary">${capitalizeFirstLetter(item.category)}</span>
                            ${item.featured ? '<span class="badge bg-warning ms-1">Featured</span>' : ''}
                        </div>
                        <p>${item.description || 'No description provided.'}</p>
                        <small class="text-muted">Added on: ${formatDate(item.created_at)}</small>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error("Failed to load portfolio details: ", error);
            document.querySelector('#portfolioDetailModal .modal-body').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load portfolio item details. Please try again.
                </div>
            `;
        });
}

/**
 * Open the Add Portfolio Item modal box
 */
function openAddPortfolioModal() {
    $("#addPortfolioForm")[0].reset();
    $("#portfolioPreview").attr("src", "../../assets/images/placeholder.jpg");

    const portfolioModal = new bootstrap.Modal(document.getElementById('addPortfolioModal'));
    portfolioModal.show();
}

function loadCategories() {
    console.log("Loading categories...");

    fetch(`${CONFIG.API.BASE_URL}/categories`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log("Categories API response status:", response.status);
            if (!response.ok) {
                throw new Error(`Failed to load categories: ${response.status}`);
            }
            return response.json();
        })
        .then(categories => {
            console.log("Categories loaded:", categories.length);

            let categoryButtons = $(".btn-group[role='group'][aria-label='Portfolio categories']");

            console.log("Category buttons container found:", categoryButtons.length > 0);

            if (categoryButtons.length === 0) {
                console.warn("Trying alternative selector for category buttons");
                categoryButtons = $(".btn-group").filter(function() {
                    return $(this).find("button[data-category]").length > 0;
                });

                if (categoryButtons.length === 0) {
                    console.error("Could not find category buttons container!");
                    return;
                }
            }

            categoryButtons.empty();
            console.log("Cleared existing category buttons");

            categoryButtons.append(`
            <button type="button" class="btn btn-outline-primary active" data-category="all">All</button>
        `);

            categories.forEach(category => {
                categoryButtons.append(`
                <button type="button" class="btn btn-outline-primary" 
                        data-category="${category.slug}">${category.name}</button>
            `);
            });

            console.log("Added category buttons:", categories.length + 1);

            $("button[data-category]").off('click').on('click', function() {
                const category = $(this).data("category");
                console.log("Category selected:", category);

                $("button[data-category]").removeClass("active");
                $(this).addClass("active");
                lastSelectedCategory = category;
                filterPortfolioItems(category);
            });

            const categorySelect = $("#portfolioCategory");
            categorySelect.empty();
            categorySelect.append('<option value="">Select category</option>');

            categories.forEach(category => {
                categorySelect.append(`<option value="${category.id}">${category.name}</option>`);
            });

            console.log("Category dropdown updated with", categories.length, "options");
        })
        .catch(error => {
            console.error("Failed to load categories:", error);
        });
}

function editPortfolioItem(itemId) {
    $("#addPortfolioForm")[0].reset();

    $("#addPortfolioModal .modal-title").text("Edit portfolio");
    $("#savePortfolioBtn").text("Save changes").data("edit-mode", true).data("item-id", itemId);

    $("#portfolioPreview").attr("src", "../../assets/images/placeholder.jpg").css("opacity", "0.5");

    loadCategories();

    fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({portfolio_id: itemId})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load portfolio item');
            }
            return response.json();
        })
        .then(data => {
            const item = Array.isArray(data) ? data[0] : data;

            $("#portfolioTitle").val(item.title);
            $("#portfolioDescription").val(item.description || '');
            $("#portfolioFeatured").prop("checked", item.featured);

            if (item.image_path) {
                $("#portfolioPreview").attr("src", item.image_path).css("opacity", "1");
            }

            $("#savePortfolioBtn").data("original-image", item.image_path);

            let categoryFound = false;
            $("#portfolioCategory option").each(function() {
                if ($(this).text() === item.category) {
                    $("#portfolioCategory").val($(this).val());
                    categoryFound = true;
                    return false;
                }
            });

            if (!categoryFound && item.category) {
                $("#portfolioCategory").append(`<option value="${item.category}" selected>${item.category}</option>`);
            }

            const portfolioModal = new bootstrap.Modal(document.getElementById('addPortfolioModal'));
            portfolioModal.show();
        })
        .catch(error => {
            console.error("Failed to load portfolio item details:", error);
            showNotification("Failed to load portfolio items", "error");
        });
}

function savePortfolioItem() {
    const editMode = $("#savePortfolioBtn").data("edit-mode") || false;
    const itemId = $("#savePortfolioBtn").data("item-id");
    const originalImage = $("#savePortfolioBtn").data("original-image");

    const title = $("#portfolioTitle").val();
    const category = $("#portfolioCategory").val();
    const description = $("#portfolioDescription").val();
    const featured = $("#portfolioFeatured").is(":checked");
    const imageFile = $("#portfolioImageUpload")[0].files[0];

    if (!title || !category) {
        showNotification("Please fill in all required fields", "warning");
        return;
    }

    const saveBtn = $("#savePortfolioBtn");
    const originalText = saveBtn.text();
    saveBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 保存中...');

    if (editMode && !imageFile) {
        updatePortfolioWithoutNewImage();
    } else {
        uploadPortfolioImage(imageFile)
            .then(response => {
                if (!response.success) {
                    throw new Error(response.message || 'Failed to upload image');
                }

                if (editMode) {
                    return updatePortfolioWithNewImage(response.image_url);
                } else {
                    return createNewPortfolio(response.image_url);
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to ${editMode ? 'Update' : 'Save'} portfolio item`);
                }
                return response.json();
            })
            .then(data => {
                bootstrap.Modal.getInstance(document.getElementById('addPortfolioModal')).hide();
                showNotification(`Portfolio item ${editMode ? 'update' : 'add'} successfully功`, "success");
                loadPortfolio(lastSelectedCategory);
                resetPortfolioModal();
            })
            .catch(error => {
                console.error(`Failed to ${editMode ? 'update' : 'save'} portfolio item:`, error);
                showNotification(`Failed to ${editMode ? 'update' : 'save'} portfolio item`, "error");
            })
            .finally(() => {
                saveBtn.prop("disabled", false).text(originalText);
            });
    }

    
    function updatePortfolioWithoutNewImage() {
        fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: itemId,
                title: title,
                category_id: category,
                description: description,
                featured: featured,
                image_path: originalImage
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update portfolio item');
                }
                return response.json();
            })
            .then(data => {
                bootstrap.Modal.getInstance(document.getElementById('addPortfolioModal')).hide();
                showNotification("Portfolio item Updated Successfully", "success");
                loadPortfolio(lastSelectedCategory);
                resetPortfolioModal();
            })
            .catch(error => {
                console.error("Failed to update portfolio item:", error);
                showNotification("Failed to update portfolio item, please try again", "error");
            })
            .finally(() => {
                saveBtn.prop("disabled", false).text(originalText);
            });
    }

    function updatePortfolioWithNewImage(imageUrl) {
        return fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: itemId,
                title: title,
                category_id: category,
                description: description,
                image_path: imageUrl,
                featured: featured
            })
        });
    }

    function createNewPortfolio(imageUrl) {
        return fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                category_id: category,
                description: description,
                image_path: imageUrl,
                featured: featured
            })
        });
    }
}

function resetPortfolioModal() {
    $("#addPortfolioModal .modal-title").text("Add Portfolio Item");
    $("#savePortfolioBtn").text("Save Item")
        .removeData("edit-mode")
        .removeData("item-id")
        .removeData("original-image");
    $("#portfolioPreview").attr("src", "../../assets/images/placeholder.jpg");
    $("#addPortfolioForm")[0].reset();
}

// Get bookings info
function loadBookings(status = "all", page = 1) {
    console.log("Status in loadBookings: ", status);
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

    $("#bookingsPagination").empty();

    const requestData = {
        filter: {
            status: status
        },
        // pagination: {
        //     page: page,
        //     limit: 10,
        // }
    };

    fetch(`${CONFIG.API.BASE_URL}/photographer/bookings-details`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load bookings. Please try again later.');
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                $("#bookingsTable").html(`
                    <tr>
                        <td colspan="8" class="text-center">
                            No bookings found.
                        </td>
                    </tr>
                `);

                $("#bookingsPagination").empty();
                return;
            }

            const bookingsHtml = data.bookings.map(booking => `
                <tr>
                    <td>${booking.customer_name}</td>
                    <td>${booking.service_name}</td>
                    <td>${formatDate(booking.booking_date)}</td>
                    <td>${booking.booking_time}</td>
                    <td>${booking.location || 'N/A'}</td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(booking.status)}">
                            ${capitalizeFirstLetter(booking.status)}
                        </span>
                    </td>
                    <td>€${booking.total_amount}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary viewBookingBtn" data-id="${booking.id}" title="View Details">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-success messageClientBtn" data-id="${booking.customer_id}" title="Message Client">
                                <i class="bi bi-chat"></i>
                            </button>
                            ${booking.status === 'pending' ? `
                                <button class="btn btn-outline-info acceptBookingBtn" data-id="${booking.id}" title="Accept Booking">
                                    <i class="bi bi-check2"></i>
                                </button>
                                <button class="btn btn-outline-danger rejectBookingBtn" data-id="${booking.id}" title="Reject Booking">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');

            $("#bookingsTable").html(bookingsHtml);

            if (data.total_pages > 1) {
                let paginationHtml = ``;

                paginationHtml += `
                    <li class="page-item ${page === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${page - 1}" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                `;

                for (let i = 1; i <= data.total_pages; i++) {
                    paginationHtml += `
                        <li class="page-item ${i === page ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i}</a>
                        </li>
                    `;
                }

                paginationHtml += `
                    <li class="page-item ${page === data.total_pages ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${page + 1}" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                `;

                $("#bookingsPagination").html(paginationHtml);


                // TODO: finish button functions
                $(".viewBookingBtn").click(function () {
                    const bookingId = $(this).data("id");
                    openBookingDetailsModal(bookingId);
                });

                $(".acceptBookingBtn").click(function () {
                    const bookingId = $(this).data("id");
                    updateBookingStatus(bookingId, "confirmed");
                });

                $(".rejectBookingBtn").click(function () {
                    const bookingId = $(this).data("id");
                    updateBookingStatus(bookingId, "cancelled");
                });

                $(".messageClientBtn").click(function () {
                    const clientId = $(this).data("id");
                    messageClient(clientId);
                });
            }
        })
        .catch(error => {
            console.error("Failed to load bookings: ", error);
            $("#bookingsTable").html(`
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        Failed to load bookings. Please try again.
                    </td>
                </tr>
            `)
        });
}

function showBookingsSection(status = "all") {
    $(".nav-link").removeClass("active");
    $('[data-section="bookings"]').addClass("active");

    $(".dashboard-section").addClass("d-none");
    $("#bookingsSection").removeClass("d-none");

    const filterText = status === "pending" ? "Pending" :
        status === "confirmed" ? "Confirmed" :
            status === "completed" ? "Completed" :
                status === "cancelled" ? "Cancelled" : "All Bookings";

    $('#bookingsSection .btn-group').find('.dropdown-toggle').html(`<i class="bi bi-filter"></i> ${filterText}`);

    $("#bookingsSection .dropdown-menu a[data-filter]").removeClass("active");
    $("#bookingsSection .dropdown-menu a[data-filter='" + status + "']").addClass("active");

    loadBookings(status);
}

function openBookingDetailsModal(bookingId) {
    if (!document.getElementById('bookingDetailModal')) {
        const modalHtml = `
            <div class="modal fade" id="bookingDetailModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Booking Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p>Loading Booking Details...</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary edit-booking-btn">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        setTimeout(() => {
            loadBookingDetails(bookingId);
        }, 100);
    } else {
        loadBookingDetails(bookingId);
    }

    const bookingModal = new bootstrap.Modal(document.getElementById('bookingDetailModal'));
    bookingModal.show();
}

function loadBookingDetails(bookingId) {
    const modalBody = document.querySelector('#bookingDetailModal .modal-body');

    if (!modalBody) {
        console.error('Booking detail modal body not found');
        return;
    }

    modalBody.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading Booking Details...</p>
        </div>
    `;

    console.log("BookingId: ", bookingId);

    fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
        method: 'GET',
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
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Customer Information</h6>
                        <p><strong>Name:</strong> ${booking.customer_name}</p>
                        <p><strong>E-mail:</strong> ${booking.customer_email || 'Not Provided'}</p>
                        <p><strong>Telephone:</strong> ${booking.customer_phone || 'Not Provided'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Booking Details</h6>
                        <p><strong>Service:</strong> ${booking.service_name}</p>
                        <p><strong>Date:</strong> ${formatDate(booking.booking_date)}</p>
                        <p><strong>Time:</strong> ${booking.booking_time}</p>
                        <p><strong>Location:</strong> ${booking.location || 'Not Specified'}</p>
                        <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(booking.status)}">${capitalizeFirstLetter(booking.status)}</span></p>
                        <p><strong>Price:</strong> €${booking.total_amount}</p>
                    </div>
                </div>
                ${booking.notes ? `
                <div class="row mt-3">
                    <div class="col-12">
                        <h6>Notes</h6>
                        <p>${booking.notes}</p>
                    </div>
                </div>` : ''}
            `;

            const editBtn = document.querySelector('#bookingDetailModal .edit-booking-btn');
            if (editBtn) {
                editBtn.onclick = function () {
                    document.body.focus();
                    bootstrap.Modal.getInstance(document.getElementById('bookingDetailModal')).hide();
                    editBooking(bookingId);
                }
            } else {
                console.error("Edit button not found");
            }
        })
        .catch(error => {
            console.error("Failed to load booking details: ", error);
            document.querySelector('#bookingDetailModal .modal-body').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load booking details. Please try again.
                </div>
            `;
        });
}

function editBooking(bookingId) {
    if (!document.getElementById('editBookingModal')) {
        const modalHtml = `
            <div class="modal fade" id="editBookingModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Booking</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p>Loading Booking Details</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveBookingChangesBtn">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        setTimeout(() => {
            editBookingDetails(bookingId);
        }, 100)
    } else {
        editBookingDetails(bookingId);
    }

    const editModal = new bootstrap.Modal(document.getElementById('editBookingModal'));
    editModal.show();
}

function editBookingDetails(bookingId) {
    const modalBody = document.querySelector('#editBookingModal .modal-body');

    if (!modalBody) {
        console.error('Edit detail modal body not found');
        return;
    }

    fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load booking data');
            }
            return response.json();
        })
        .then(booking => {
            const bookingDate = booking.booking_date ? new Date(booking.booking_date) : new Date();
            const formattedDate = bookingDate.toISOString().split('T')[0]; 

            let bookingTime = '';
            if (booking.booking_time) {
                if (booking.booking_time.includes('T')) {
                    bookingTime = booking.booking_time.split('T')[1].substring(0, 5); 
                } else if (booking.booking_time.includes(':')) {
                    bookingTime = booking.booking_time.substring(0, 5);
                }
            }
            modalBody.innerHTML = `
                <form id="editBookingForm">
                    <input type="hidden" id="editBookingId" value="${booking.id}">
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="editBookingDate" class="form-label">Date</label>
                            <input type="date" class="form-control" id="editBookingDate" value="${formattedDate}" required>
                        </div>
                        <div class="col-md-6">
                            <label for="editBookingTime" class="form-label">Time</label>
                            <input type="time" class="form-control" id="editBookingTime" value="${bookingTime}" required>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="editBookingLocation" class="form-label">Location</label>
                        <input type="text" class="form-control" id="editBookingLocation" value="${booking.location || ''}">
                    </div>
                    
                    <div class="mb-3">
                        <label for="editBookingStatus" class="form-label">Status</label>
                        <select class="form-select" id="editBookingStatus" required>
                            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="editBookingNotes" class="form-label">Notes</label>
                        <textarea class="form-control" id="editBookingNotes" rows="3">${booking.notes || ''}</textarea>
                    </div>
                </form>
            `;

            document.getElementById('saveBookingChangesBtn').onclick = saveBookingChanges;
        })
        .catch(error => {
            console.error("Failed to load booking data: ", error);
            document.querySelector('#editBookingModal .modal-body').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load booking data. Please try again.
                </div>
            `;
        })
}

function saveBookingChanges() {
    const bookingId = document.getElementById('editBookingId').value;
    const bookingDate = document.getElementById('editBookingDate').value;
    const bookingTime = document.getElementById('editBookingTime').value;
    const bookingLocation = document.getElementById('editBookingLocation').value;
    const bookingStatus = document.getElementById('editBookingStatus').value;
    const bookingNotes = document.getElementById('editBookingNotes').value;

    if (!bookingDate || !bookingTime || !bookingStatus) {
        showNotification("请填写所有必填字段", "warning");
        return;
    }

    const saveBtn = document.getElementById('saveBookingChangesBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...`;

    fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            booking_date: bookingDate,
            booking_time: bookingTime,
            location: bookingLocation,
            status: bookingStatus,
            notes: bookingNotes
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save booking changes');
            }
            return response.json();
        })
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('editBookingModal')).hide();
            showNotification("Booking changes saved successfully", "success");
            loadBookings();
        })
        .catch(error => {
            console.error("Failed to load booking changes: ", error);
            showNotification("Error while saving booking changes");
        })
        .finally(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Changes";
        })
}

function messageClient(clientId) {
    $(".nav-link").removeClass("active");
    $('[data-section="messages"]').addClass("active");
    $(".dashboard-section").addClass("d-none");
    $("#messagesSection").removeClass("d-none");

    loadMessages(clientId);
}

function updateBookingStatus(bookingId, status) {
    if (!confirm(`Are you sure you want to update this booking status to ${status === 'confirmed' ? "Confirmed" : "Cancelled"}?`)) {
        return;
    }

    fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: status
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update booking status');
            }
            return response.json();
        })
        .then(data => {
            showNotification("Booking updated successfully", "success");
            loadBookings();
        })
        .catch(error => {
            console.error("Failed to update booking status: ", error);
            showNotification("Error while saving booking changes. Please try again.", "danger");
        })
}


// Get services and prices info
function loadServices(onlyFeatured = false) {
    $("#servicesList").html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading services...</p>
        </div>
    `);

    const requestData = {
        filter: {
            is_featured: onlyFeatured ? 1 : null,
            is_active: 1
        }
    };

    fetch(`${CONFIG.API.BASE_URL}/photographer/services`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load services. Please try again later.');
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                $("#servicesList").html(`
                    <div class="col-12">
                        <div class="alert alert-info">
                            No services found. Add some services to attract clients.
                        </div>
                    </div>
                `);
                return;
            }

            const serviceHtml = data.map(service => {
                const featuresHtml = service.features && service.features.length > 0 ?
                    `
                        <ul class="list-group list-group-flush mt-3">
                            ${service.features.map(feature => `
                                <li class="list-group-item d-flex align-items-center">
                                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    ` : '';

                const unitDisplay = formatServiceUnit(service.unit, service.duration);

                return `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 service-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">${service.name}</h5>
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li><a class="dropdown-item edit-service-btn" href="#" data-id="${service.id}">
                                            <i class="bi bi-pencil me-2"></i> Edit
                                        </a></li>
                                        <li><a class="dropdown-item ${service.is_featured ? 'unfeature-service-btn' : 'feature-service-btn'}" href="#" data-id="${service.id}">
                                            <i class="bi bi-star${service.is_featured ? '-fill' : ''} me-2"></i> 
                                            ${service.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                                        </a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item text-danger delete-service-btn" href="#" data-id="${service.id}">
                                            <i class="bi bi-trash me-2"></i> Delete
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="card-body">
                                ${service.image_url ? `
                                    <div class="service-image-container mb-3">
                                        <img src="${service.image_url}" class="img-fluid rounded" alt="${service.name}">
                                    </div>
                                ` : ''}
                                <h6 class="price-tag">€${parseFloat(service.price).toFixed(2)} <small class="text-muted">/ ${unitDisplay}</small></h6>
                                <p class="card-text">${service.description || 'No description provided.'}</p>
                                ${featuresHtml}
                            </div>
                            <div class="card-footer bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">Last updated: ${formatDate(service.updated_at)}</small>
                                    ${service.is_featured ? '<span class="badge bg-warning">Featured</span>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            $("#servicesList").html(serviceHtml);
        })
        .catch(error => {
            console.error("Failed to load services:", error);
            $("#servicesList").html(`
                <div class="col-12">
                    <div class="alert alert-danger">
                        Failed to load services. Please try again.
                    </div>
                </div>
            `);
        });

}

function formatServiceUnit(unit, duration) {
    switch (unit) {
        case 'hour':
            return 'hour';
        case 'session':
            return duration ? `session (${Math.floor(duration / 60)}h ${duration % 60 > 0 ? duration % 60 + 'min' : ''})` : 'session';
        case 'package':
            return 'package';
        case 'day':
            return 'day';
        default:
            return unit || 'session';
    }
}

/**
 * Open the Add Service modal box
 */
function openAddServiceModal() {
    $("#addServiceForm")[0].reset();

    $("#serviceFeatures").html(`
        <div class="input-group mb-2">
            <input type="text" class="form-control" placeholder="e.g., 2-hour photoshoot" name="features[]">
            <button class="btn btn-outline-secondary remove-feature" type="button">
                <i class="bi bi-dash"></i>
            </button>
        </div>
    `);

    setupRemoveFeatureButtons();

    const serviceModal = new bootstrap.Modal(document.getElementById('addServiceModal'));
    serviceModal.show();
}

// Get Messages
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

    
    API.getConversations()
        .then(conversations => {
            window.conversationsData = conversations || [];

            if (!conversations || conversations.length === 0) {
                $("#conversationsList").html(`
                    <div class="p-3 text-center">
                        <p class="text-muted">No conversations yet</p>
                        <button class="btn btn-sm btn-outline-primary" id="startNewConversationBtn">
                            Start a new conversation
                        </button>
                    </div>
                `);

                $("#startNewConversationBtn").click(function() {
                    
                    showNotification("This feature is not available yet", "info");
                });
                return;
            }

            const conversationsHtml = conversations.map(conversation => {
                
                let otherPartyName, otherPartyImage, unreadCount;

                if (conversation.customer) {
                    otherPartyName = conversation.customer.name || 'Client';
                    otherPartyImage = conversation.customer.profile_image || '../../assets/images/default-avatar.jpg';
                } else if (conversation.sender) {
                    otherPartyName = conversation.sender.name || 'Client';
                    otherPartyImage = conversation.sender.profile_image || '../../assets/images/default-avatar.jpg';
                } else {
                    otherPartyName = 'Client';
                    otherPartyImage = '../../assets/images/default-avatar.jpg';
                }

                unreadCount = conversation.unread_count || 0;

                let lastMessageTime = formatDate(conversation.last_message_time || conversation.created_at);
                let lastMessageText = conversation.last_message || 'No messages yet';

                const unreadClass = unreadCount > 0 ? 'fw-bold' : '';
                const unreadBadge = unreadCount > 0
                    ? `<span class="badge bg-danger rounded-pill ms-2">${unreadCount}</span>`
                    : '';

                return `
                <a href="#" class="list-group-item list-group-item-action conversation-item ${unreadClass}" 
                   data-id="${conversation.id}"
                   data-other-name="${otherPartyName}">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="${otherPartyImage}" class="rounded-circle me-2" width="32" height="32" alt="${otherPartyName}">
                            <h6 class="mb-1">${otherPartyName} ${unreadBadge}</h6>
                        </div>
                        <small class="text-muted">${lastMessageTime}</small>
                    </div>
                    <p class="mb-1 text-truncate ps-4">${lastMessageText}</p>
                </a>
                `;
            }).join('');

            $("#conversationsList").html(conversationsHtml);

            $(".conversation-item").click(function(e) {
                e.preventDefault();
                const conversationId = $(this).data("id");
                const otherName = $(this).data("other-name");

                if (!conversationId) {
                    console.error("Missing conversation ID");
                    return;
                }

                $("#sendMessageForm").data("conversation-id", conversationId);
                $("#conversationTitle").text(otherName);

                $(this).removeClass("fw-bold")
                    .find(".badge").remove();

                $(".conversation-item").removeClass("active");
                $(this).addClass("active");

                $("#conversationMenu").removeClass("d-none");

                loadConversationMessages(conversationId);
                API.markMessagesAsRead(conversationId);
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

function loadConversationMessages(conversationId) {
    $("#messagesContainer").html(`
        <div class="text-center p-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading messages...</p>
        </div>
    `);

    
    API.getUserProfile()
        .then(userData => {
            const currentUserId = userData.id;

            
            return API.getConversationMessages(conversationId)
                .then(response => {
                    const messages = response.data || [];

                    if (messages.length === 0) {
                        $("#messagesContainer").html(`
                            <div class="text-center p-5">
                                <i class="bi bi-chat-dots display-4 text-muted"></i>
                                <p class="mt-3">No messages in this conversation</p>
                            </div>
                        `);
                        return;
                    }

                    const messagesHtml = messages.map(msg => {
                        
                        const isCurrentUser = parseInt(msg.sender_id) === parseInt(currentUserId);
                        const alignClass = isCurrentUser ? 'justify-content-end' : 'justify-content-start';
                        const bgColor = isCurrentUser ? '#007bff' : '#f1f1f1';
                        const textColor = isCurrentUser ? '#fff' : '#000';

                        const time = formatTime(msg.created_at);
                        const date = formatDate(msg.created_at);

                        return `
                            <div class="d-flex ${alignClass} mb-3">
                                <div class="message-bubble" style="background: ${bgColor}; color: ${textColor}; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                                    <div class="message-content">
                                        <p class="mb-0">${msg.message}</p>
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

                    $("#messageInputContainer").removeClass("d-none");

                    
                    setTimeout(scrollToBottom, 100);
                });
        })
        .catch(error => {
            console.error("Failed to load conversation messages:", error);
            $("#messagesContainer").html(`
                <div class="alert alert-danger">
                    Failed to load messages. Please try again.
                </div>
            `);
        });
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

function displayConversationMessages(conversation, user_id) {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
        $("#messagesContainer").html(`
            <div class="text-center p-5">
                <i class="bi bi-chat-dots display-4 text-muted"></i>
                <p class="mt-3">No messages in this conversation</p>
            </div>
        `);
        return;
    }

    const photographerId = user_id;
    console.log(photographerId);

    const messagesHtml = conversation.messages.map(msg => {
        const isOwn = msg.sender_id === photographerId;

        return `
            <div class="d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'} mb-3">
                <div class="message-bubble ${isOwn ? 'message-own' : 'message-other'}" style="background: ${isOwn ? '#007bff' : '#f1f1f1'}; color: ${isOwn ? '#fff' : '#000'};">
                    <div class="message-content">
                        <p class="mb-0">${msg.message}</p>
                        <small class="text-muted d-block text-${isOwn ? 'end' : 'start'} mt-1" style="color: ${isOwn ? '#fff' : '#000'} !important;">
                            ${formatDate(msg.created_at)}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    $("#messagesContainer").html(`
        <div class="messages-wrapper">
            ${messagesHtml}
        </div>
    `);

    const messageWrapper = document.querySelector("#messages-wrapper");
    if (messageWrapper) {
        messageWrapper.scrollTop = messageWrapper.scrollHeight;
    }
}

function sendMessage(conversationId, messageText) {
    const sendButton = $("#sendMessageForm button[type='submit']");
    sendButton.prop("disabled", true);

    
    $("#messageInput").val("");

    
    const currentTime = new Date();
    const formattedTime = formatTime(currentTime);
    const formattedDate = formatDate(currentTime);

    
    const tempId = 'msg_' + Date.now();

    
    const newMessageHtml = `
        <div class="d-flex justify-content-end mb-3" id="${tempId}">
            <div class="message-bubble" style="background: #007bff; color: #fff; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                <div class="message-content">
                    <p class="mb-0">${messageText}</p>
                    <small class="d-block text-end mt-1" style="opacity: 0.8; color: #fff !important;">
                        ${formattedDate} ${formattedTime}
                        <span class="message-status"><i class="bi bi-clock"></i></span>
                    </small>
                </div>
            </div>
        </div>
    `;

    
    if ($(".messages-wrapper").length === 0) {
        $("#messagesContainer").html('<div class="messages-wrapper d-flex flex-column"></div>');
    }

    
    $(".messages-wrapper").append(newMessageHtml);

    
    scrollToBottom();

    
    API.replyToConversation({
        conversation_id: conversationId,
        message: messageText
    })
        .then(response => {
            console.log("Message sent successfully:", response);

            
            $(`#${tempId} .message-status`).html('<i class="bi bi-check-all"></i>');

            
            
            updateConversationPreview(conversationId, messageText);
        })
        .catch(error => {
            console.error("Failed to send message:", error);

            
            $(`#${tempId} .message-status`).html('<i class="bi bi-exclamation-triangle text-danger"></i>');

            showNotification("Failed to send message. Please try again.", "error");
        })
        .finally(() => {
            sendButton.prop("disabled", false);
            $("#messageInput").focus();
        });
}

function updateConversationPreview(conversationId, lastMessage) {
    const conversationItem = $(`.conversation-item[data-id="${conversationId}"]`);
    if (conversationItem.length) {
        
        conversationItem.find("p.mb-1").text(lastMessage);

        
        const now = new Date();
        conversationItem.find("small.text-muted").text(formatDate(now));

        
        const conversationsList = $("#conversationsList");
        conversationsList.prepend(conversationItem);
    }
}

//Get reviews info
function loadReviews(page = 1) {
    $("#reviewsContainer").html(`
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading reviews...</p>
        </div>
    `);

    const requestData = {
        page: page
    };

    fetch(`${CONFIG.API.BASE_URL}/photographer/reviews/details`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load reviews. Please try again later.');
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                $("#reviewsContainer").html(`
                    <div class="alert alert-info">
                        No reviews found.
                    </div>
                `);
                return;
            }

            let reviewHtml = '';

            if (data.stats) {
                reviewHtml = `
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h2 class="display-4">${parseFloat(data.stats.average_rating).toFixed(1)}</h2>
                                    <div class="mb-2">
                                        ${generateStarRating(data.stats.average_rating)}
                                    </div>
                                    <p class="text-muted mb-0">Based on ${data.stats.total_reviews} reviews</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="mb-3">Rating Distribution</h5>
                                    <div class="rating-bars">
                                        ${generateRatingBars(data.stats.rating_distribution)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            const reviewCards = data.reviews.map(review => {
                const hasReply = review.reply !== null && review.reply !== '';
                const reviewClass = hasReply ? '' : 'new';

                return `
                    <div class="card review-card ${reviewClass} mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 class="card-title mb-1">${review.title}</h5>
                                    <div>
                                        ${generateStarRating(review.rating)}
                                        <small class="text-muted ms-2">${formatDate(review.created_at)}</small>
                                    </div>
                                </div>
                                <div>
                                    <button class="btn btn-sm ${hasReply ? 'btn-outline-secondary' : 'btn-outline-primary'} replyBtn" data-id="${review.id}">
                                        ${hasReply ? '<i class="bi bi-pencil"></i> Edit Reply' : '<i class="bi bi-reply"></i> Reply'}
                                    </button>
                                </div>
                            </div>
                            <p class="card-text">${review.review}</p>
                            <div class="d-flex align-items-center">
                                <img src="../../assets/images/default-avatar.jpg" class="rounded-circle me-2" width="30" height="30" alt="Customer">
                                <small>Customer #${review.customer_id} • ${review.service_type}</small>
                            </div>
                            ${hasReply ? `
                                <div class="review-reply mt-3">
                                    <small class="text-muted">Your reply • ${formatDate(review.reply_date)}</small>
                                    <p class="mb-0 mt-1">${review.reply}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            reviewHtml += reviewCards;

            if (data.total_pages > 1) {
                reviewsHtml += `
                    <nav aria-label="Reviews pagination" class="mt-4">
                        <ul class="pagination justify-content-center" id="reviewsPagination">
                            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                                <a class="page-link" href="#" data-page="${page - 1}" aria-label="Previous">
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            <li class="page-item ${page === data.total_pages ? 'disabled' : ''}">
                                <a class="page-link" href="#" data-page="${page + 1}" aria-label="Next">
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                `;
            }

            $("#reviewsContainer").html(reviewHtml);
        })
        .catch((error) => {
            console.error("Failed to load reviews:", error);
            $("#reviewsContainer").html(`
                <div class="alert alert-danger">
                    Failed to load reviews. Please try again.
                </div>
            `);
        });
}

function generateRatingBars(distribution) {
    let html = '';
    const totalReviews = Object.values(distribution).reduce((a, b) => a + b, 0);

    
    for (let i = 5; i >= 1; i--) {
        const count = distribution[i] || 0;
        const percentage = totalReviews ? (count / totalReviews * 100).toFixed(1) : 0;

        html += `
            <div class="rating-bar-row d-flex align-items-center mb-2">
                <div class="rating-label me-2">${i} <i class="bi bi-star-fill text-warning"></i></div>
                <div class="progress flex-grow-1" style="height: 10px;">
                    <div class="progress-bar bg-warning" role="progressbar" style="width: ${percentage}%" 
                         aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="rating-count ms-2">${count}</div>
            </div>
        `;
    }

    return html;
}

/**
 * Open the comment reply modal box
 * @param {number} reviewId - id of the comment
 */
function openReviewReplyModal(reviewId) {
    $("#reviewReplyModal .modal-body").html(`
        <div class="text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading review...</p>
        </div>
    `);

    $("#reviewReplyModal .modal-footer").hide();

    const replyModal = new bootstrap.Modal(document.getElementById('reviewReplyModal'));
    replyModal.show();

    fetch(`${CONFIG.API.BASE_URL}/photographer/reviews/item`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: reviewId})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load review details');
            }
            return response.json();
        })
        .then(review => {
            updateReviewReplyModal(review);

            $("#reviewReplyModal .modal-footer").show();

            $("#submitReplyBtn").data("reviewId", review.id);
        })
        .catch(error => {
            console.error("Failed to load review details:", error);
            $("#reviewReplyModal .modal-body").html(`
            <div class="alert alert-danger">
                Failed to load review details. Please try again.
            </div>
        `);
        });
}

/**
 * update commit modal box content
 * @param {Object} review - comment data
 */
function updateReviewReplyModal(review) {
    $("#reviewReplyModal .modal-body").html(`
        <div class="review-container mb-3">
            <div class="d-flex align-items-start">
                <img src="${review.customer.profile_image || '../../assets/images/default-avatar.jpg'}" alt="Client" class="rounded-circle me-2" width="40" height="40" id="reviewClientImage">
                <div>
                    <h6 id="reviewClientName">${review.customer.name}</h6>
                    <div id="reviewRating" class="mb-1">
                        ${generateStarRating(review.rating)}
                    </div>
                    <small class="text-muted" id="reviewDate">${formatDate(review.created_at)}</small>
                </div>
            </div>
            <h6 class="mt-3" id="reviewTitle">${review.title}</h6>
            <p id="reviewText">${review.review}</p>
        </div>
        <hr>
        <form id="reviewReplyForm">
            <div class="mb-3">
                <label for="replyText" class="form-label">Your Reply</label>
                <textarea class="form-control" id="replyText" rows="4" required>${review.reply || ''}</textarea>
            </div>
        </form>
    `);
}

/**
 * submit comment reply
 */
function submitReviewReply() {
    
    const reviewId = $("#submitReplyBtn").data("reviewId");
    const replyText = $("#replyText").val();

    if (!replyText.trim()) {
        showNotification("Please enter reply content", "warning");
        return;
    }

    const submitBtn = $("#submitReplyBtn");
    const originalText = submitBtn.text();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting');

    
    fetch(`${CONFIG.API.BASE_URL}/photographer/reviews/reply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({reply: replyText, id: reviewId})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to submit reply');
            }
            return response.json();
        })
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('reviewReplyModal')).hide();

            
            const isUpdate = data.is_update ? "update" : "submit";
            showNotification(`Reply ${isUpdate} succeed`, "success");

            
            if ($("#reviewsSection").is(":visible")) {
                loadReviews();
            } else {
                loadRecentReviews();
            }
        })
        .catch(error => {
            console.error("Failed to submit reply:", error);
            showNotification("Failed to submit reply. Please try again later", "error");
        })
        .finally(() => {
            submitBtn.prop("disabled", false).text(originalText);
        });
}

/**
 * Setting the Service Feature Removal Button Event
 */
function setupRemoveFeatureButtons() {
    $(".remove-feature").off('click').on('click', function () {
        // If there is only one feature, clear the input instead of deleting the line
        if ($("#serviceFeatures .input-group").length === 1) {
            $(this).closest(".input-group").find("input").val("");
            return;
        }
        // del the line
        $(this).closest(".input-group").remove();
    });
}

/**
 * Add service feature input line
 */
function addServiceFeatureInput() {
    const newFeatureInput = `
        <div class="input-group mb-2">
            <input type="text" class="form-control" placeholder="e.g., Digital delivery" name="features[]">
            <button class="btn btn-outline-secondary remove-feature" type="button">
                <i class="bi bi-dash"></i>
            </button>
        </div>
    `;

    $("#serviceFeatures").append(newFeatureInput);
    setupRemoveFeatureButtons();
}

/**
 * save service
 */
function saveService() {
    const name = $("#serviceName").val();
    const description = $("#serviceDescription").val();
    const price = $("#servicePrice").val();
    const unit = $("#serviceUnit").val();
    const duration = $("#serviceDuration").val();
    const featured = $("#serviceFeatured").is(":checked");

    const features = [];
    $("#serviceFeatures input").each(function () {
        const feature = $(this).val().trim();
        if (feature) {
            features.push(feature);
        }
    });

    if (!name || !price || !unit) {
        alert("Please fill in all required fields");
        return;
    }

    const saveBtn = $("#saveServiceBtn");
    const originalText = saveBtn.text();
    saveBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');

    fetch(`${CONFIG.API.BASE_URL}/services`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            description: description,
            price: price,
            unit: unit,
            duration: duration,
            is_featured: featured,
            features: features
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save service');
            }
            return response.json();
        })
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('addServiceModal')).hide();

            showNotification("Service added successfully", "success");

            loadServices();
        })
        .catch(error => {
            console.error("Failed to save service:", error);
            showNotification("Failed to save service. Please try again.", "error");
        })
        .finally(() => {
            saveBtn.prop("disabled", false).text(originalText);
        });
}

// Get the detailed photographer information
function loadDetailedPhotographerData() {
    document.getElementById('profileName').textContent = 'Loading...';
    document.getElementById('profileEmail').textContent = 'loading@example.com';
    document.getElementById('infoName').textContent = 'Loading...';
    document.getElementById('infoEmail').textContent = 'Loading...';
    document.getElementById('infoPhone').textContent = 'Loading...';
    document.getElementById('infoLocation').textContent = 'Loading...';
    document.getElementById('infoSpecialization').textContent = 'Loading...';
    document.getElementById('infoExperience').textContent = 'Loading...';
    document.getElementById('infoBio').textContent = 'Loading...';
    document.getElementById('photographerCategories').innerHTML = `
        <div class="text-center">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    fetch(`${CONFIG.API.BASE_URL}/photographer/profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load photographer data');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('profileName').textContent = data.name || 'Not set';
            document.getElementById('profileEmail').textContent = data.email || 'Not set';
            document.getElementById('profileMember').textContent = `Member since: ${new Date(data.created_at).toLocaleDateString()}`;

            document.getElementById('infoName').textContent = data.name;
            document.getElementById('infoEmail').textContent = data.email;
            document.getElementById('infoPhone').textContent = data.phone || 'Not provided';
            document.getElementById('infoLocation').textContent = data.location || 'Not provided';
            document.getElementById('infoSpecialization').textContent = data.specialization || 'Not provided';
            document.getElementById('infoExperience').textContent = `${data.experience_years || 0} years`;
            document.getElementById('infoBio').textContent = data.bio || 'No bio provided';

            if (data.profile_image) {
                document.getElementById('profileImage').src = data.profile_image;
            }

            const categoriesContainer = document.getElementById('photographerCategories');
            if (data.categories && data.categories.length > 0) {
                const categoriesHtml = data.categories.map(category => {
                    return `<span class="badge bg-primary me-1 mb-1">${category}</span>`;
                }).join('');
                categoriesContainer.innerHTML = categoriesHtml;
            } else {
                categoriesContainer.innerHTML = '<p class="text-muted mb-0">未指定类别</p>';
            }

            document.getElementById('totalSessions').textContent = data.photoshoot_count || 0;
            document.getElementById('totalEarnings').textContent = `€${(data.total_earnings || 0).toFixed(2)}`; // data.totalEarnings
            document.getElementById('totalReviews').textContent = data.review_count || 0;
            document.getElementById('profileViews').textContent = data.view_count || 0; // data.viewCount

            $("#editName").val(data.name || "");
            $("#editEmail").val(data.email || "");
            $("#editPhone").val(data.phone || "");
            $("#editLocation").val(data.location || "");
            $("#editSpecialization").val(data.specialization || "");
            $("#editExperience").val(data.experience_years || 0);
            $("#editBio").val(data.bio || "");

            if (data.categories) {
                loadCategories(data.categories);
            }

        })
        .catch(error => {
            console.error("Failed to load photographer data", error);
            document.getElementById('profileName').textContent = 'Error loading data';
            document.getElementById('profileEmail').textContent = 'Please try again later';
            document.getElementById('photographerCategories').innerHTML = '<p class="text-danger">Failed to load categories</p>';
        })
}

function initPasswordChangeFeature() {
    $("a[data-settings='password']").on("click", function (e) {
        e.preventDefault();
        console.log("Change Password link clicked");
        showPasswordModal();
    });

    $(document).on("click", ".toggle-password", function () {
        togglePasswordVisibility($(this));
    });

    $(document).on("input", "#newPassword", function () {
        updatePasswordStrength($(this).val());
    });

    $("#submitPasswordBtn").on("click", function () {
        submitPasswordChange();
    });

    $('#changePasswordModal').on('hidden.bs.modal', function () {
        resetPasswordForm();
    });
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
    console.log("Password change button clicked");//debug
    const currentPassword = $("#currentPassword").val();
    const newPassword = $("#newPassword").val();
    const confirmPassword = $("#confirmNewPassword").val();
    if (!validatePasswordForm(currentPassword, newPassword, confirmPassword)) {
        return;
    }

    const submitButton = $("#submitPasswordBtn");
    setButtonLoading(submitButton, true);

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
        showNotification("The new password needs to be at least 8 characters", "warning");
        return false;
    }

    if (newPassword !== confirmPassword) {
        showNotification("New password does not match the confirmation password", "warning");
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
                    throw {status: response.status, data: data};
                });
            }
            return response.json();
        });
}

function handlePasswordChangeSuccess(data) {
    console.log("Password changed successfully");
    resetPasswordForm();
    bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
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
        button.prop("disabled", false).text("修改密码");
    }
}


function openEditProfileModal() {
    fetch(`${CONFIG.API.BASE_URL}/photographer/profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load photographer profile data');
            }
            return response.json();
        })
        .then(data => {
            $("#editName").val(data.name || "");
            $("#editEmail").val(data.email || "");
            $("#editPhone").val(data.phone || "");
            $("#editLocation").val(data.location || "");
            $("#editSpecialization").val(data.specialization || "");
            $("#editExperience").val(data.experience_years || 0);
            $("#editBio").val(data.bio || "");

            if (data.profile_image) {
                $("#previewProfileImage").attr("src", data.profile_image);
            } else {
                $("#previewProfileImage").attr("src", "../../assets/images/default-photographer.jpg");
            }

            loadCategories(data.categories || []);

            const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
            editProfileModal.show();
        })
        .catch(error => {
            console.error("Failed to load profile data:", error);
            showNotification("Failed to load profile data", "error");
        });
}

function loadCategories() {
    console.log("Loading categories...");

    fetch(`${CONFIG.API.BASE_URL}/categories`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load categories: ${response.status}`);
            }
            return response.json();
        })
        .then(categories => {
            console.log("Categories loaded:", categories.length);
            const categoryButtons = $("#portfolioCategoryButtons");

            if (categoryButtons.length === 0) {
                console.error("Portfolio category buttons container not found with ID");
                return;
            }

            categoryButtons.empty();
            categoryButtons.append(`
            <button type="button" class="btn btn-outline-primary active" data-category="all">All</button>
        `);

            categories.forEach(category => {
                categoryButtons.append(`
                <button type="button" class="btn btn-outline-primary" 
                        data-category="${category.slug}">${category.name}</button>
            `);
            });

            $("#portfolioCategoryButtons button[data-category]").off('click').on('click', function() {
                const category = $(this).data("category");
                $("#portfolioCategoryButtons button[data-category]").removeClass("active");
                $(this).addClass("active");
                lastSelectedCategory = category;
                filterPortfolioItems(category);
            });

            const categorySelect = $("#portfolioCategory");
            categorySelect.empty();
            categorySelect.append('<option value="">Select category</option>');

            categories.forEach(category => {
                categorySelect.append(`<option value="${category.id}">${category.name}</option>`);
            });
        })
        .catch(error => {
            console.error("Failed to load categories:", error);
        });
}

function saveProfileChanges() {
    const profileData = {
        name: $("#editName").val(),
        email: $("#editEmail").val(),
        phone: $("#editPhone").val(),
        location: $("#editLocation").val(),
        specialization: $("#editSpecialization").val(),
        experience_years: parseInt($("#editExperience").val(), 10) || 0,
        bio: $("#editBio").val()
    };

    const selectedCategories = [];
    $("input[name='categories[]']:checked").each(function () {
        selectedCategories.push($(this).val());
    });
    profileData.categories = selectedCategories;

    $("#saveProfileBtn").prop("disabled", true).html(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Saving...
    `);

    fetch(`${CONFIG.API.BASE_URL}/photographer/profile/update`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update personal data');
            }
            return response.json();
        })
        .then(data => {
            const profileImageInput = document.getElementById("profileImageUpload");
            if (profileImageInput.files && profileImageInput.files[0]) {
                return uploadProfileImage(profileImageInput.files[0]);
            }
            return data;
        })
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
            loadDetailedPhotographerData();
            showNotification("Personal Information Update Successful", "success");
        })
        .catch(error => {
            console.error("Failed to update personal data:", error);
            showNotification("Failed to update personal data", "error");
        })
        .finally(() => {
            $("#saveProfileBtn").prop("disabled", false).text("Save Changes");
        });
}

function uploadProfileImage(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    return fetch(`${CONFIG.API.BASE_URL}/photographer/profile/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload avatar');
            }
            return response.json();
        });
}

function previewImage(file, previewElementId) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $(`#${previewElementId}`).attr("src", e.target.result);
    };
    reader.readAsDataURL(file);
}

function uploadPortfolioImage(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    return fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload portfolio image');
            }
            return response.json();
        });
}