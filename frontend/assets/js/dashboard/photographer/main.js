let lastSelectedCategory = "all";

$(document).ready(function () {
    loadPhotographerData();
    PhotographerDashboard.init();
    PhotographerServices.init();
    setupEventHandlers();
    loadSectionFromUrlHash();

    $('#addPortfolioModal').on('hidden.bs.modal', function () {
        PhotographerPortfolio.resetPortfolioModal();
    });

    window.addEventListener('hashchange', function () {
        loadSectionFromUrlHash();
    });

    $(document).on('hidden.bs.modal', '.modal', function () {
        if ($('.modal.show').length === 0) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open').css('overflow', '');
            $('body').css('padding-right', '');
        }
    });

    $(document).on('click', '.edit-service-btn', function (e) {
        e.preventDefault();
        const serviceId = $(this).data("id");
        PhotographerServices.openEditServiceModal(serviceId);
    })

    $(document).on('click', '.feature-service-btn', function (e) {
        e.preventDefault();
        const serviceId = $(this).data("id");
        PhotographerServices.updateServiceFeatured(serviceId, true);
    })

    $(document).on('click', '.unfeature-service-btn', function (e) {
        e.preventDefault();
        const serviceId = $(this).data('id');
        PhotographerServices.updateServiceFeatured(serviceId, false);
    });

    $(document).on('click', '.delete-service-btn', function (e) {
        e.preventDefault();
        const serviceId = $(this).data('id');
        PhotographerServices.deleteService(serviceId);
    })
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
        PhotographerDashboard.loadDashboardData();
        PhotographerBookings.checkPendingBookings();
        showNotification("Dashboard data refreshed", "info");
    });

    $("#viewProfileLink, #editProfileLink").click(function (e) {
        e.preventDefault();
        $(".nav-link").removeClass("active");
        $('[data-section="profile"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#profileSection").removeClass("d-none");
        $(document).trigger("section:profile");

        if (this.id === "editProfileLink") {
            PhotographerProfile.openEditProfileModal();
        }
    });

    $("#viewPendingOrdersLink").click(function (e) {
        e.preventDefault();
        PhotographerBookings.showBookingsSection("pending");
    });

    $("#viewActiveOrdersLink").click(function (e) {
        e.preventDefault();
        PhotographerBookings.showBookingsSection("confirmed");
    });

    $("#viewEarningsLink").click(function (e) {
        e.preventDefault();
        alert("Earnings statistics coming soon!");
    });

    $("#viewReviewsLink").click(function (e) {
        e.preventDefault();
        PhotographerReviews.showReviewsSection();
    });

    $("#viewAllBookingsBtn").click(function (e) {
        e.preventDefault();
        PhotographerBookings.showBookingsSection("all");
    });

    $("#viewAllReviewsBtn").click(function (e) {
        e.preventDefault();
        PhotographerReviews.showReviewsSection();
    });

    $("#addPortfolioItemBtn").click(function (e) {
        e.preventDefault();
        PhotographerPortfolio.openAddPortfolioModal();
    });

    $("#addServiceBtn").click(function (e) {
        e.preventDefault();
        PhotographerServices.openAddServiceModal();
    });

    $('#addServiceBtn').off('click').on('click', function() { // ???
        $("#addServiceForm")[0].reset();
        $("#addServiceModal .modal-title").text("Add New Service");
        $("#saveServiceBtn").removeData("id").text("Save Service");

        $("#serviceFeatures").html(`
            <div class="input-group mb-2">
                <input type="text" class="form-control" placeholder="e.g., 2-hour photoshoot" name="features[]">
                <button class="btn btn-outline-secondary remove-feature" type="button">
                    <i class="bi bi-dash"></i>
                </button>
            </div>
        `);

        PhotographerServices.setupRemoveFeatureButtons();

        const serviceModal = new bootstrap.Modal(document.getElementById('addServiceModal'));
        serviceModal.show();
    });

    $("button[data-category]").click(function () {
        const category = $(this).data("category");
        $("button[data-category]").removeClass("active");
        $(this).addClass("active");
        lastSelectedCategory = category;
        PhotographerPortfolio.filterPortfolioItems(category);
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
                PhotographerBookings.initializeBookingsCalendar();
            }
        }
    });

    $(document).on("click", ".replyBtn", function () {
        const reviewId = $(this).data("id");
        PhotographerReviews.openReviewReplyModal(reviewId);
    });

    $(".dropdown-menu a[data-filter]").click(function (e) {
        e.preventDefault();
        const filterStatus = $(this).data("filter");

        const filterText = $(this).text();
        $(this).closest('.btn-group').find('.dropdown-toggle').html(`<i class="bi bi-filter"></i> ${filterText}`);

        $(".dropdown-menu a[data-filter]").removeClass("active");
        $(this).addClass("active");

        PhotographerBookings.loadBookings(filterStatus);
    });

    $(document).on("section:portfolio", function () {
        PhotographerPortfolio.loadPortfolio(lastSelectedCategory);

        $("button[data-category]").removeClass("active");
        $(`button[data-category="${lastSelectedCategory}"]`).addClass("active");
    });

    $(document).on("section:bookings", function () {
        PhotographerBookings.loadBookings();
    });

    $(document).on("section:services", function () {
        PhotographerServices.loadServices();
    });

    $(document).on("section:messages", function () {
        PhotographerMessages.loadMessages();
    });

    $(document).on("section:reviews", function () {
        PhotographerReviews.loadReviews();
    });

    $(document).on("section:profile", function () {
        PhotographerProfile.loadDetailedPhotographerData();
    });

    $(document).on("section:portfolio", function () {
        PhotographerPortfolio.loadCategories();
        PhotographerPortfolio.loadPortfolio(lastSelectedCategory);
    });

    $(document).on('click', '.viewBookingBtn', function() {
        const bookingId = $(this).data('id');
        PhotographerBookings.openBookingDetailsModal(bookingId);
    });

    $(document).on('click', '.acceptBookingBtn', function() {
        const bookingId = $(this).data('id');
        PhotographerBookings.updateBookingStatus(bookingId, "confirmed");
    });

    $(document).on('click', '.rejectBookingBtn', function() {
        const bookingId = $(this).data('id');
        PhotographerBookings.updateBookingStatus(bookingId, "cancelled");
    });

    $(document).on('click', '.messageClientBtn', function() {
        const clientId = $(this).data('id');
        if (typeof PhotographerMessages !== 'undefined' && PhotographerMessages.messageClient) {
            PhotographerMessages.messageClient(clientId);
        } else {
            showNotification("Message function is not available", "warning");
        }
    });

    $(".dropdown-item[data-timeframe]").click(function (e) {
        e.preventDefault();
        const timeframe = $(this).data("timeframe");

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

        $(".dropdown-item[data-timeframe]").removeClass("active");
        $(this).addClass("active");

        PhotographerDashboard.loadEarningsChart(timeframe);
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
        PhotographerServices.addServiceFeatureInput();
    });

    $('#addFeatureBtn').off('click').on('click', function() {
        PhotographerServices.addServiceFeatureInput();
    });

    $("#savePortfolioBtn").click(function () {
        PhotographerPortfolio.savePortfolioItem();
    });

    $("#saveServiceBtn").click(function () {
        PhotographerServices.saveService();
    });

    $('#saveServiceBtn').off('click').on('click', function() {
        PhotographerServices.saveService();
    });

    $("#submitReplyBtn").click(function () {
        PhotographerReviews.submitReviewReply();
    });

    $(document).on("section:settings", function () {
        PhotographerSettings.initPasswordChangeFeature();
    });

    $("#editProfileBtn").click(function (e) {
        e.preventDefault();
        PhotographerProfile.openEditProfileModal();
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
        PhotographerProfile.saveProfileChanges();
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

                PhotographerProfile.uploadProfileImage(this.files[0])
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

    $("#markAsReadBtn").click(function (e) {
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

    $("#viewClientProfileBtn").click(function (e) {
        e.preventDefault();
        const conversationId = $("#sendMessageForm").data("conversation-id");
        const conversation = window.conversationsData.find(c => c.id == conversationId);

        if (conversation && conversation.customer && conversation.customer.id) {
            showNotification("Client profile view is not available", "info");
        } else {
            showNotification("Could not find client information", "warning");
        }
    });

    $("#refreshMessagesBtn").click(function () {
        PhotographerMessages.loadMessages();
        showNotification("Messages refreshed", "info");
    });

    $(document).on("submit", "#sendMessageForm", function (e) {
        e.preventDefault();
        const messageText = $("#messageInput").val().trim();
        const conversationId = $(this).data("conversation-id");

        if (messageText && conversationId) {
            PhotographerMessages.sendMessage(conversationId, messageText);
        }
    });
}

function loadSectionFromUrlHash() {
    const hash = window.location.hash;
    if (!hash) return;

    if (hash.startsWith('#bookings:')) {
        const status = hash.split(':')[1];
        PhotographerBookings.showBookingsSection(status);
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

function previewImage(file, previewElementId) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $(`#${previewElementId}`).attr("src", e.target.result);
    };
    reader.readAsDataURL(file);
}