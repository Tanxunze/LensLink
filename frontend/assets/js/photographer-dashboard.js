// Most of the code can be reused, but I haven't figured out how to decouple it. - Xunze
// All media upload functionality will need to be rewritten at a later date and now only exists locally. - Xunze
/* Note: Please use the following standard comment style for each js function so that it can be read and modified by other contributors. -Xunze
* Description: A brief description of the function.
* Input parameter: @param {type} name - description
* Output parameter: @returns {type} - description
*/
$(document).ready(function () {
    loadPhotographerData();
    loadDashboardData();
    setupEventHandlers();
    loadSectionFromUrlHash();
});

function setupEventHandlers() {
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
        showBookingsSection("active");
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

    $("#addSpecialDateBtn").click(function (e) {
        e.preventDefault();
        openSpecialDateModal();
    });

    $("button[data-category]").click(function () {
        const category = $(this).data("category");
        $("button[data-category]").removeClass("active");
        $(this).addClass("active");
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

    // loading event listeners
    $(document).on("section:portfolio", function () {
        loadPortfolio();
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

    $(document).on("section:availability", function () {
        loadAvailability();
    });

    $(document).on("section:profile", function () {
        loadDetailedPhotographerData();
    });

    $(document).on("section:settings", function () {
        loadSettings();
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

    $("input[name='availabilityType']").change(function () {
        if ($(this).val() === "custom") {
            $("#customHoursContainer").removeClass("d-none");
        } else {
            $("#customHoursContainer").addClass("d-none");
        }
    });

    $("#saveSpecialDateBtn").click(function () {
        saveSpecialDate();
    });

    $("#submitReplyBtn").click(function () {
        submitReviewReply();
    });
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
    // 显示加载状态
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

            $(".replyBtn").click(function () {
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
function filterPortfolioItems(category){
    loadPortfolio(category);
}

// Get portfolio information
function loadPortfolio(category = 'all') {
    $('#portifolioItems').html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading portfolio...</p>
        </div>
    `);

    const requestData = {
        filter: {
            category: category
        }
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

            const portfolioItemHtml = data.map(item => `
                <div class="col-md-4 mb-4 portfolio-item" data-category="${item.category}">
                    <div class="card h-100">
                        <div class="portfolio-image-container">
                            <img src="${item.image_path}" class="card-img-top" alt="${item.title}">
                            <div class="overlay">
                                <button class="btn btn-sm btn-light view-portfolio-btn" data-id="${item.id}">
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
            `).join('');

            $("#portfolioItems").html(portfolioItemHtml);

            // Setup click event for View button
            $(".view-profile-btn").click(function () {

            });

            //Maybe Edit button too.
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

/**
 * Open the Add Portfolio Item modal box
 */
function openAddPortfolioModal() {
    $("#addPortfolioForm")[0].reset();
    $("#portfolioPreview").attr("src", "../../assets/images/placeholder.jpg");

    const portfolioModal = new bootstrap.Modal(document.getElementById('addPortfolioModal'));
    portfolioModal.show();
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

/**
 * Open special date modal box
 */
function openSpecialDateModal() {
    $("#specialDateForm")[0].reset();
    $("#customHoursContainer").addClass("d-none");

    // Set the minimum date to today
    const today = new Date().toISOString().split('T')[0];
    $("#specialDate").attr("min", today);

    const specialDateModal = new bootstrap.Modal(document.getElementById('specialDateModal'));
    specialDateModal.show();
}

/**
 * Open the comment reply modal box
 * @param {number} reviewId - id of the comment
 */
function openReviewReplyModal(reviewId) {
    // 显示加载状态
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

    fetch(`${CONFIG.API.BASE_URL}/reviews/${reviewId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        }
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
                <img src="${review.customer.image || '../../assets/images/default-avatar.jpg'}" alt="Client" class="rounded-circle me-2" width="40" height="40" id="reviewClientImage">
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
    // fetch id & reply content
    const reviewId = $("#submitReplyBtn").data("reviewId");
    const replyText = $("#replyText").val();

    if (!replyText.trim()) {
        alert("Please enter a reply");
        return;
    }

    const submitBtn = $("#submitReplyBtn");
    const originalText = submitBtn.text();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...');

    fetch(`${CONFIG.API.BASE_URL}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({reply: replyText})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to submit reply');
            }
            return response.json();
        })
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('reviewReplyModal')).hide();

            showNotification("Reply submitted successfully", "success");

            if ($("#reviewsSection").is(":visible")) {
                loadReviews();
            } else {
                loadRecentReviews();
            }
        })
        .catch(error => {
            console.error("Failed to submit reply:", error);
            showNotification("Failed to submit reply. Please try again.", "error");
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
 * save Portfolio Item
 */
function savePortfolioItem() {
    // fetch form data
    const title = $("#portfolioTitle").val();
    const category = $("#portfolioCategory").val();
    const description = $("#portfolioDescription").val();
    const featured = $("#portfolioFeatured").is(":checked");
    const imageFile = $("#portfolioImageUpload")[0].files[0];

    if (!title || !category || !imageFile) {
        alert("Please fill in all required fields");
        return;
    }

    const saveBtn = $("#savePortfolioBtn");
    const originalText = saveBtn.text();
    saveBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');

    // upload image
    uploadImage(imageFile)
        .then(imageData => {
            // 然后保存作品集项目
            return fetch(`${CONFIG.API.BASE_URL}/portfolio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    category_id: category,
                    description: description,
                    image_path: imageData.url,
                    featured: featured
                })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save portfolio item');
            }
            return response.json();
        })
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('addPortfolioModal')).hide();

            showNotification("Portfolio item added successfully", "success");

            loadPortfolio();
        })
        .catch(error => {
            console.error("Failed to save portfolio item:", error);
            showNotification("Failed to save portfolio item. Please try again.", "error");
        })
        .finally(() => {
            saveBtn.prop("disabled", false).text(originalText);
        });
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

/**
 * Save the Special Date
 */
function saveSpecialDate() {
    const date = $("#specialDate").val();
    const availabilityType = $("input[name='availabilityType']:checked").val();
    const startTime = $("#specialStartTime").val();
    const endTime = $("#specialEndTime").val();
    const note = $("#specialDateNote").val();

    if (!date) {
        alert("Please select a date");
        return;
    }

    if (availabilityType === "custom" && (!startTime || !endTime)) {
        alert("Please specify both start and end times");
        return;
    }

    const saveBtn = $("#saveSpecialDateBtn");
    const originalText = saveBtn.text();
    saveBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');

    const requestData = {
        date: date,
        is_available: availabilityType === "custom",
        note: note
    };

    // If it's a custom time, add a start and end time
    if (availabilityType === "custom") {
        requestData.start_time = startTime;
        requestData.end_time = endTime;
    }

    fetch(`${CONFIG.API.BASE_URL}/availability/special-dates`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save special date');
            }
            return response.json();
        })
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('specialDateModal')).hide();

            showNotification("Special date added successfully", "success");

            loadAvailability();
        })
        .catch(error => {
            console.error("Failed to save special date:", error);
            showNotification("Failed to save special date. Please try again.", "error");
        })
        .finally(() => {
            saveBtn.prop("disabled", false).text(originalText);
        });
}

// Todo