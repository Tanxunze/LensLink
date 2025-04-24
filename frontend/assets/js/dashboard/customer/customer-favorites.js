const CustomerFavorites = {
    init: function() {
        // No specific initialization needed for this module
    },

    loadSavedPhotographers: function() {
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
                    CustomerFavorites.removeFromFavorites(photographerId);
                });
            })
            .catch(error => {
                console.error("Failed to load saved photographers:", error);
                $("#savedPhotographersList").html(`
                    <div class="col-12">
                        <div class="alert alert-danger">
                            <p>Failed to load your saved photographers. Please try again later.</p>
                            <button class="btn btn-sm btn-outline-danger mt-2" onclick="CustomerFavorites.loadSavedPhotographers()">
                                <i class="bi bi-arrow-clockwise"></i> Retry
                            </button>
                        </div>
                    </div>
                `);
            });
    },

    removeFromFavorites: function(photographerId) {
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
};