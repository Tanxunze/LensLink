const CustomerDashboardData = {
    init: function() {
        this.loadAllData();
    },

    loadAllData: function() {
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
            this.loadDashboardCounts(),
            this.loadRecentBookings(),
            this.loadRecommendedPhotographers()
        ])
            .then(() => {
                console.log("loaded successfully");
            })
            .catch(error => {
                console.error(error);
                showNotification("Dashboard data couldn't be loaded", "warning");
            });
    },

    loadDashboardCounts: function() {
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
    },

    loadRecentBookings: function() {
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
                    CustomerBookings.openBookingDetailsModal(bookingId);
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
    },

    loadRecommendedPhotographers: function() {
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
};