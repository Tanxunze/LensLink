const PhotographerReviews = {
    init: function() {
        
    },

    showReviewsSection: function() {
        $(".nav-link").removeClass("active");
        $('[data-section="reviews"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#reviewsSection").removeClass("d-none");

        this.loadReviews();
        $(".replyBtn").click(function (e) {
            const reviewId = $(this).data("id");
            PhotographerReviews.openReviewReplyModal(reviewId);
        });
    },

    loadReviews: function(page = 1) {
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
                                            ${this.generateRatingBars(data.stats.rating_distribution)}
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
    },

    generateRatingBars: function(distribution) {
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
    },

    openReviewReplyModal: function(reviewId) {
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
                this.updateReviewReplyModal(review);

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
    },

    updateReviewReplyModal: function(review) {
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
    },

    submitReviewReply: function() {

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
                    this.loadReviews();
                } else {
                    PhotographerDashboard.loadRecentReviews();
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
};