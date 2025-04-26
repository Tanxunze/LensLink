const PhotographerDashboard = {
    init: function() {
        this.loadDashboardData();
        $(document).on("section:dashboard", () => {
            this.loadDashboardData();
        });
    },

    loadDashboardData: function() {
        this.loadDashboardCounts();
        this.loadEarningsChart(180); 
        this.loadRecentBookings();
        this.loadRecentReviews();
    },

    loadDashboardCounts: function() {
        fetch(`${CONFIG.API.BASE_URL}/bookings/count?status=pending`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                $("#pendingOrdersCount").text(data.count);

                
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
                const rating = data.rating ? parseFloat(data.rating) : 0;
                $("#overallRating").text(isNaN(rating) ? "0.0" : rating.toFixed(1));
            })
            .catch(error => {
                console.error("Failed to load overall rating:", error);
                $("#overallRating").text("0.0");
            });
    },

    loadEarningsChart: function(days) {
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
    },

    loadRecentBookings: function() {
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
                    PhotographerBookings.openBookingDetailsModal(bookingId);
                });

                $(".messageClientBtn").click(function () {
                    const clientId = $(this).data("id");
                    PhotographerMessages.messageClient(clientId);
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
    },

    loadRecentReviews: function() {
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
                    PhotographerReviews.openReviewReplyModal(reviewId);
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
};