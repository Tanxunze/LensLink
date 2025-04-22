let photographerId = null;
let photographerData = null;
let selectedRating = 0;
let services = [];
let selectedServiceId = null;

$(document).ready(function () {
    // Extract ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    photographerId = urlParams.get('id');

    if (!photographerId) {
        window.location.href = 'photographers.html';
        return;
    }

    loadPhotographerDetails();

    // Event handlers
    $("#bookNowBtn").on("click", openBookingModal);
    $("#contactBtn").on("click", openContactModal);
    $("#writeReviewBtn").on("click", openReviewModal);

    // Rating stars interaction in review modal
    $(".rating-star").on("click", function () {
        const rating = parseInt($(this).data('rating'));
        selectRating(rating);
    });

    $(".rating-star").on("mouseenter", function () {
        const rating = parseInt($(this).data('rating'));
        highlightStars(rating);
    });

    $(".rating-input").on("mouseleave", function () {
        resetStars();
        highlightStars(selectedRating);
    });

    // Form submission handlers
    $("#submitReviewBtn").on("click", submitReview);
    $("#sendMessageBtn").on("click", sendMessage);
    $("#confirmBookingBtn").on("click", confirmBooking);

    // Dynamic form updates
    $("#bookingService").on("change", updateBookingSummary);
    $("#bookingDate").on("change", updateBookingSummary);
    $("#bookingTime").on("change", updateBookingSummary);

    $("#favoriteBtn").on("click", toggleFavorite);

    checkLoginStatus();
    
});

function checkLoginStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
        $("#favoriteBtn").hide();
    } else {
        checkFavoriteStatus();
    }
}

function checkFavoriteStatus() {
    if (!localStorage.getItem("token") || !photographerId) {
        return;
    }

    API.request(`/favorites/check/${photographerId}`)
        .then(response => {
            isFavorite = response.is_favorite;
            updateFavoriteButton();
        })
        .catch(error => {
            console.error("Failed to check favorite status:", error);
            isFavorite = false;
            updateFavoriteButton();
        });
}

function updateFavoriteButton() {
    const $btn = $("#favoriteBtn");

    if (isFavorite) {
        $btn.addClass("active");
        $btn.find("i").removeClass("bi-heart").addClass("bi-heart-fill");
        $btn.find(".favorite-text").text("Saved");
    } else {
        $btn.removeClass("active");
        $btn.find("i").removeClass("bi-heart-fill").addClass("bi-heart");
        $btn.find(".favorite-text").text("Save");
    }
}

function toggleFavorite() {
    if (!localStorage.getItem("token")) {
        alert("Please log in to save photographers");
        window.location.href = "../pages/auth/login.html";
        return;
    }

    const $btn = $("#favoriteBtn");
    $btn.prop("disabled", true);

    if (isFavorite) {
        API.removeFromFavorites(photographerId)
            .then(response => {
                isFavorite = false;
                $btn.addClass("animating");
                setTimeout(() => {
                    $btn.removeClass("animating");
                    updateFavoriteButton();
                }, 500);
                $.lenslink.showNotification("Photographer removed from favorites", "success");
            })
            .catch(error => {
                console.error("Failed to remove from favorites:", error);
                $.lenslink.showNotification("Failed to update favorites", "error");
            })
            .finally(() => {
                $btn.prop("disabled", false);
            });
    } else {
        API.addToFavorites(photographerId)
            .then(response => {
                isFavorite = true;
                $btn.addClass("animating");
                setTimeout(() => {
                    $btn.removeClass("animating");
                    updateFavoriteButton();
                }, 500);
                $.lenslink.showNotification("Photographer added to favorites", "success");
            })
            .catch(error => {
                console.error("Failed to add to favorites:", error);
                $.lenslink.showNotification("Failed to update favorites", "error");
            })
            .finally(() => {
                $btn.prop("disabled", false);
            });
    }
}

function loadPhotographerDetails() {
    return API.getPhotographerProfile(photographerId)
        .then(data => {
            photographerData = data;
            console.log("API response:", data);

            displayPhotographerInfo(data);

            if (data.services && Array.isArray(data.services)) {
                displayServices(data.services);
                services = data.services;
            } else {
                console.warn("No valid services array in API response");
                services = [];
                $("#servicesList").html('<div class="col-12"><div class="alert alert-warning">Could not load services.</div></div>');
            }

            displayPortfolio(data.portfolio);
            displayReviews(data.reviews);
            checkFavoriteStatus();
        })
        .catch(error => {
            console.error('Error fetching photographer details:', error);
            showErrorMessage('Failed to load photographer details. Please try again later.');
        });
}

function displayPhotographerInfo(photographer) {
    document.title = `${photographer.name} - LensLink`;

    $("#photographerBanner").css('background-image', `url('${photographer.banner_image || "../assets/images/default-banner.jpg"}')`);

    $("#photographerName").text(photographer.name);

    $("#photographerImage").attr('src', photographer.profile_image || '../assets/images/default-photographer.jpg');

    $("#photographerSpecialization").text(photographer.specialization);
    $("#photographerLocation").text(photographer.location);
    $("#photographerExperience").text(`${photographer.experience_years} years experience`);
    $("#photographerPhotoshootCount").text(`${photographer.photoshoot_count}+ photoshoots`);
    $("#photographerBio").text(photographer.bio);

    // Set rating
    const ratingHtml = $.lenslink.generateStarRating(photographer.rating);
    $("#photographerRating").html(`
        ${ratingHtml}
        <span class="ms-2">${photographer.rating} (${photographer.review_count} reviews)</span>
    `);
}

function displayServices(servicesData) {
    if (!Array.isArray(servicesData)) {
        console.error(servicesData);
        $("#servicesList").html('<div class="col-12"><div class="alert alert-danger">Invalid services data format.</div></div>');
        return;
    }

    if (servicesData.length === 0) {
        $("#servicesList").html('<div class="col-12"><div class="alert alert-info">This photographer has not added any services yet.</div></div>');
        return;
    }

    services = servicesData; 
    console.log("Services saved to global variable:", services);

    const servicesHtml = servicesData.map((service, index) => {
        const isFeatured = service.is_featured;
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 ${isFeatured ? 'border-primary' : ''}">
                    ${isFeatured ? '<div class="ribbon">Most Popular</div>' : ''}
                    <div class="card-body">
                        <h5 class="card-title">${service.name}</h5>
                        <h6 class="card-subtitle mb-3 text-primary">€${service.price}/${service.unit}</h6>
                        <p class="text-muted small mb-3">${service.description || ''}</p>
                        <ul class="list-unstyled">
                            ${service.features.map(feature => `
                                <li><i class="bi bi-check2 text-success"></i> ${feature}</li>
                            `).join('')}
                        </ul>
                        <button class="btn btn-primary w-100 select-service-btn" data-id="${service.id}" data-name="${service.name}" data-price="${service.price}">
                            Select Package
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    $("#servicesList").html(servicesHtml);

    $(".select-service-btn").on("click", function () {
        const serviceId = parseInt($(this).data('id'));
        console.log("Service button clicked, id:", serviceId);
        console.log("Current services array:", services);
        openBookingModal(serviceId);
    });
}

function displayPortfolio(portfolio) {
    if (!portfolio || portfolio.length === 0) {
        $("#portfolio").html('<div class="col-12"><div class="alert alert-info">This photographer has not added any portfolio items yet.</div></div>');
        return;
    }

    const portfolioHtml = portfolio.map(item => {
        const imageUrl = item.image.startsWith('http') ?
            item.image :
            `../assets/images/${item.image}`;

        return `
            <div class="col-md-4 col-sm-6">
                <div class="portfolio-item" data-id="${item.id}">
                    <img src="${imageUrl}" class="img-fluid" alt="${item.title}">
                    <div class="portfolio-overlay">
                        <div class="portfolio-info">
                            <h4>${item.title}</h4>
                            <p>${item.category}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    $("#portfolio").html(portfolioHtml);

    // Add click event to open portfolio item in lightbox
    $(".portfolio-item").on("click", function () {
        const itemId = $(this).data('id');
        const item = portfolio.find(p => p.id === itemId);

        if (item) {
            const imageUrl = item.image.startsWith('http') ?
                item.image :
                `../assets/images/${item.image}`;

            $("#portfolioModalTitle").text(item.title);
            $("#portfolioModalImage").attr('src', imageUrl);
            $("#portfolioModalDescription").text(item.description || '');

            const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioModal'));
            portfolioModal.show();
        }
    });
}

function displayReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        $("#reviewsList").html('<div class="alert alert-info">This photographer has not received any reviews yet.</div>');
        return;
    }

    const reviewsHtml = reviews.map(review => `
        <div class="card mb-4">
            <div class="card-body">
                <div class="d-flex mb-3">
                    <img src="${review.customer_image || '../assets/images/default-avatar.jpg'}" 
                         class="rounded-circle me-3 customer-contact-trigger" 
                         width="50" height="50" 
                         alt="${review.customer_name}"
                         data-customer-id="${review.customer_id}" 
                         data-customer-name="${review.customer_name}"
                         style="cursor: pointer;">
                    <div>
                        <h6 class="mb-1 customer-contact-trigger" 
                            data-customer-id="${review.customer_id}" 
                            data-customer-name="${review.customer_name}"
                            style="cursor: pointer;">${review.customer_name}</h6>
                        <div class="mb-2">
                            ${$.lenslink.generateStarRating(review.rating)}
                        </div>
                        <small class="text-muted">${review.service_type} - ${$.lenslink.formatDate(review.service_date)}</small>
                    </div>
                </div>
                <h5 class="card-title">${review.title}</h5>
                <p class="card-text">${review.review}</p>
                ${review.reply ? `
                    <div class="bg-light p-3 mt-3 rounded">
                        <small class="text-muted">Photographer's response - ${$.lenslink.formatDate(review.reply_date)}</small>
                        <p class="mb-0 mt-2">${review.reply}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    $("#reviewsList").html(reviewsHtml);

    // Add click event for customer contact
    $(".customer-contact-trigger").on("click", function() {
        const customerId = $(this).data('customer-id');
        const customerName = $(this).data('customer-name');

        // Check if trying to contact yourself
        const currentUserId = localStorage.getItem("userId");
        if (customerId.toString() === currentUserId) {
            $.lenslink.showNotification("You cannot contact yourself.", "warning");
            return;
        }

        openContactRequestModal(customerId, customerName);
    });
}

function openBookingModal(serviceId) {
    // Check if user is logged in
    if (!localStorage.getItem("token")) {
        alert("Please log in to book a session");
        window.location.href = "../pages/auth/login.html";
        return;
    }
    console.log('serviceId: ', serviceId);
    console.log("Available services:", services);
    // Populate services dropdown
    let servicesOptions = '<option value="">Select a package</option>';
    services.forEach(service => {
        servicesOptions += `<option value="${service.id}" ${serviceId === service.id ? 'selected' : ''}>${service.name} (€${service.price}/${service.unit})</option>`;
    });
    $("#bookingService").html(servicesOptions);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    $("#bookingDate").attr('min', today);

    // Set photographer name in summary
    $("#summaryPhotographer").text(photographerData.name);

    // Set default values
    if (typeof serviceId === 'number') {
        $("#bookingService").val(serviceId);
        updateBookingSummary();
    }

    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    bookingModal.show();
}

function openContactModal() {
    // Check if user is logged in
    if (!localStorage.getItem("token")) {
        alert("Please log in to contact a photographer");
        window.location.href = "../pages/auth/login.html";
        return;
    }

    $("#contactForm")[0].reset();

    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    contactModal.show();
}

function openReviewModal() {
    // Check if user is logged in
    if (!localStorage.getItem("token")) {
        alert("Please log in to write a review");
        window.location.href = "../pages/auth/login.html";
        return;
    }

    // Check if user is a customer
    if (localStorage.getItem("userRole") !== "customer") {
        alert("Only customers can write reviews");
        return;
    }

    $("#reviewForm")[0].reset();
    selectedRating = 0;
    resetStars();

    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    reviewModal.show();
}

function selectRating(rating) {
    selectedRating = rating;
    $("#ratingInput").val(rating);
    highlightStars(rating);
}

function highlightStars(rating) {
    $(".rating-star").each(function (index) {
        if (index < rating) {
            $(this).removeClass('bi-star').addClass('bi-star-fill active');
        } else {
            $(this).removeClass('bi-star-fill active').addClass('bi-star');
        }
    });
}

function resetStars() {
    $(".rating-star").removeClass('bi-star-fill active').addClass('bi-star');
}

function updateBookingSummary() {
    const serviceId = $("#bookingService").val();
    const date = $("#bookingDate").val();
    const time = $("#bookingTime").val();

    if (serviceId) {
        const service = services.find(s => s.id.toString() === serviceId);
        if (service) {
            $("#summaryService").text(`${service.name} (€${service.price}/${service.unit})`);
            $("#summaryTotal").text(`€${service.price}`);
            selectedServiceId = serviceId;
        }
    } else {
        $("#summaryService").text("No service selected");
        $("#summaryTotal").text("€0.00");
        selectedServiceId = null;
    }

    if (date) {
        const formattedDate = new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        $("#summaryDate").text(formattedDate);
    } else {
        $("#summaryDate").text("Not selected");
    }

    if (time) {
        const formattedTime = time;
        $("#summaryTime").text(formattedTime);
    } else {
        $("#summaryTime").text("Not selected");
    }
}

function submitReview() {
    // Validate form
    if (!$("#reviewForm")[0].checkValidity() || !selectedRating) {
        alert("Please fill all fields and select a rating");
        return;
    }

    const reviewData = {
        photographer_id: photographerId,
        rating: selectedRating,
        title: $("#reviewTitle").val(),
        review: $("#reviewText").val(),
        service_type: $("#serviceType").val(),
        service_date: $("#serviceDate").val()
    };

    API.createReview(reviewData)
        .then(data => {
            // Close modal and show success message
            bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
            $.lenslink.showNotification("Review submitted successfully!", "success");

            // Reload reviews
            loadPhotographerDetails();
        })
        .catch(error => {
            console.error('Error submitting review:', error);
            $.lenslink.showNotification("Failed to submit review. Please try again.", "error");
        });
}

function sendMessage() {
    // Validate form
    if (!$("#contactForm")[0].checkValidity()) {
        alert("Please fill all fields");
        return;
    }

    const messageData = {
        photographer_id: photographerId,
        subject: $("#contactSubject").val(),
        message: $("#contactMessage").val()
    };

    API.sendMessage(messageData)
        .then(data => {
            // Close modal and show success message
            bootstrap.Modal.getInstance(document.getElementById('contactModal')).hide();
            $.lenslink.showNotification("Message sent successfully!", "success");
        })
        .catch(error => {
            console.error('Error sending message:', error);
            $.lenslink.showNotification("Failed to send message. Please try again.", "error");
        });
}

function confirmBooking() {
    if (!$("#bookingForm")[0].checkValidity()) {
        alert("Please fill all required fields");
        return;
    }

    if (!selectedServiceId) {
        alert("Please select a service package");
        return;
    }

    const selectedService = services.find(s => s.id.toString() === selectedServiceId.toString());
    if (!selectedService) {
        console.error("Could not find selected service:", selectedServiceId, services);
        alert("Invalid service selected");
        return;
    }

    const bookingData = {
        photographer_id: photographerId,
        service_id: selectedServiceId,
        booking_date: $("#bookingDate").val(),
        start_time: $("#bookingTime").val(),
        location: $("#bookingLocation").val(),
        notes: $("#bookingNotes").val(),
        total_amount: selectedService.price 
    };

    console.log("Sending booking data:", bookingData);

    API.createBooking(bookingData)
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
            $.lenslink.showNotification("Booking created successfully!", "success");

            setTimeout(() => {//redirect to dashboard
                window.location.href = "../pages/dashboard/customer.html";
            }, 2000);
        })
        .catch(error => {
            console.error('Error creating booking:', error);
            $.lenslink.showNotification("Failed to create booking. Please try again.", "error");
        });
}

function showErrorMessage(message) {
    $("main").prepend(`
        <div class="container mt-4">
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    `);
}

function openContactRequestModal(customerId, customerName) {
    // Check if user is logged in
    if (!localStorage.getItem("token")) {
        alert("Please log in to connect with other users");
        window.location.href = "../pages/auth/login.html";
        return;
    }

    if (localStorage.getItem("userRole") !== "customer") {
        $.lenslink.showNotification("Only customers can connect with other customers", "warning");
        return;
    }

    $("#requestRecipientName").text(customerName);
    $("#contactRequestForm")[0].reset();
    $("#sendRequestBtn").off("click").on("click", function() {
        sendContactRequest(customerId, $("#requestMessage").val());
    });

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('contactRequestModal'));
    modal.show();
}

function sendContactRequest(recipientId, message) {
    const requestData = {
        recipient_id: recipientId,
        message: message || ""
    };

    $("#sendRequestBtn").prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');

    API.sendContactRequest(requestData)
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('contactRequestModal')).hide();
            $.lenslink.showNotification("Contact request sent successfully!", "success");
        })
        .catch(error => {
            console.error("Error sending contact request:", error);
            $.lenslink.showNotification("Failed to send contact request. Please try again.", "error");
        })
        .finally(() => {
            $("#sendRequestBtn").prop("disabled", false).text("Send Request");
        });
}