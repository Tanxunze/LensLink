const CustomerDashboard = {
    init: function() {
        this.loadUserData();
        CustomerDashboardData.init();
        this.setupEventHandlers();
        this.loadSectionFromUrlHash();

        $(document).on('hidden.bs.modal', '.modal', function () {
            if ($('.modal.show').length === 0) {
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open').css('overflow', '');
                $('body').css('padding-right', '');
            }
        });
    },

    loadUserData: function() {
        CustomerProfile.loadBasicUserData();
    },

    setupEventHandlers: function() {
        // Universal section navigation handler
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
            CustomerDashboardData.loadAllData();
            showNotification("Dashboard data refreshed", "info");
        });

        $("#viewProfileLink, #editProfileLink").click(function (e) {
            e.preventDefault();
            $(".nav-link").removeClass("active");
            $('[data-section="profile"]').addClass("active");
            $(".dashboard-section").addClass("d-none");
            $("#profileSection").removeClass("d-none");

            if (this.id === "editProfileLink") {
                CustomerProfile.openEditProfileModal();
            }
            CustomerProfile.loadDetailedUserData();

            window.location.hash = "profile";
        });

        // Quick Links
        $("#viewActiveBookingsLink").click(function (e) {
            e.preventDefault();
            CustomerBookings.showBookingsSection("active");
        });

        $("#viewCompletedSessionsLink").click(function (e) {
            e.preventDefault();
            CustomerBookings.showBookingsSection("completed");
        });

        $("#viewMessagesLink").click(function (e) {
            e.preventDefault();
            CustomerMessages.showMessagesSection();
        });

        $("#viewAllBookingsBtn").click(function (e) {
            e.preventDefault();
            CustomerBookings.showBookingsSection("all");
        });

        // Section Load Event Listeners
        $(document).on("section:bookings", function () {
            CustomerBookings.loadBookings();
        });

        $(document).on("section:messages", function () {
            CustomerMessages.loadMessages();
        });

        $(document).on("section:savedPhotographers", function () {
            CustomerFavorites.loadSavedPhotographers();
        });

        $(document).on("section:profile", function () {
            CustomerProfile.loadDetailedUserData();
        });

        // Handle URL hash changes
        window.addEventListener('hashchange', function () {
            CustomerDashboard.loadSectionFromUrlHash();
        });

        // Initialize modules
        CustomerProfile.init();
        CustomerBookings.init();
        CustomerMessages.init();
        CustomerFavorites.init();
        CustomerSettings.init();
        CustomerContacts.init();
    },

    loadSectionFromUrlHash: function() {
        const hash = window.location.hash;
        if (!hash) return;

        // Handle specialized format: #bookings:active
        if (hash.startsWith('#bookings:')) {
            const status = hash.split(':')[1];
            CustomerBookings.showBookingsSection(status);
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
};