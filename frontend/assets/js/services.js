let allServices = [];
let categories = [];

$(document).ready(function () {
    // Initialize page
    loadServices();

    // Add event listener for retry button
    $("#retryButton").on("click", loadServices);

    // Update photographer profile link when opening modal
    $("#serviceModal").on("show.bs.modal", function (event) {
        const button = $(event.relatedTarget);
        const serviceId = button.data("service-id");
        if (serviceId) {
            loadServiceDetails(serviceId);
        }
    });
});

/**
 * Fetch services data from API
 */
function loadServices() {
    // Show loading, hide error
    $("#servicesLoadingIndicator").removeClass("d-none");
    $("#servicesErrorMessage").addClass("d-none");
    $(".service-item").remove();
    $(".empty-state").remove();

    // Use API class method
    API.getServices()
        .then(function (data) {
            allServices = data.services || [];
            extractCategories();
            renderCategoryFilters();
            renderServices(allServices);
            $("#servicesLoadingIndicator").addClass("d-none");
        })
        .catch(function (error) {
            console.error("Error fetching services:", error);

            // Provide more detailed error messages
            let errorMessage = "Failed to load services. Please try again later.";
            if (error.status === 404) {
                errorMessage = "No services found. Please check back later.";
            } else if (error.status === 500) {
                errorMessage = "Server error occurred. Our team has been notified.";
            } else if (error.status === 0) {
                errorMessage = "Network error. Please check your connection.";
            }

            // Hide loading, show error
            $("#servicesLoadingIndicator").addClass("d-none");
            $("#servicesErrorMessage").removeClass("d-none");
            $("#errorText").text(errorMessage);
        });
}

/**
 * Load service details from API
 */
function loadServiceDetails(serviceId) {
    // Show loading, hide error
    $("#modalLoadingIndicator").removeClass("d-none");
    $("#modalErrorMessage").addClass("d-none");
    $(".service-detail-content").remove();
    $("#serviceModalLabel").text("Loading Service Details...");

    API.getServiceDetails(serviceId)
        .then(function (data) {
            $("#modalLoadingIndicator").addClass("d-none");
            renderServiceDetails(data.service);

            // Update modal title with service name
            $("#serviceModalLabel").text(data.service.title);

            // Update view photographer button link
            $("#viewPhotographersBtn").attr(
                "href",
                `./photographer-detail.html?id=${data.service.photographer.id}`
            );
            $("#viewPhotographersBtn").text(
                `View ${data.service.photographer.name}'s Profile`
            );
        })
        .catch(function (error) {
            console.error("Error fetching service details:", error);

            // Provide more detailed error messages
            let errorMessage = "Failed to load service details. Please try again later.";
            if (error.status === 404) {
                errorMessage = "Service not found.";
            } else if (error.status === 500) {
                errorMessage = "Server error occurred. Our team has been notified.";
            } else if (error.status === 0) {
                errorMessage = "Network error. Please check your connection.";
            }

            $("#modalLoadingIndicator").addClass("d-none");
            $("#modalErrorMessage").removeClass("d-none");
            $("#modalErrorText").text(errorMessage);

            // Reset modal title
            $("#serviceModalLabel").text("Service Details");

            // Reset view photographer button
            $("#viewPhotographersBtn").attr("href", "./photographers.html");
            $("#viewPhotographersBtn").text("Browse Photographers");
        });
}

/**
 * Extract unique categories from services
 */
function extractCategories() {
    const categorySet = new Set(["all"]);

    // Extract categories from services
    $.each(allServices, function (i, service) {
        if (service.category) {
            if (typeof service.category === "string") {
                categorySet.add(service.category.toLowerCase());
            } else if (Array.isArray(service.category)) {
                $.each(service.category, function (j, cat) {
                    categorySet.add(cat.toLowerCase());
                });
            }
        }
    });

    // Convert Set to Array
    categories = Array.from(categorySet);
}

/**
 * Render category filter buttons
 */
function renderCategoryFilters() {
    const $categoryFilters = $("#categoryFilters");

    // Remove loading spinner
    $("#categoryLoadingSpinner").remove();

    // Clear existing filter buttons except 'All Services'
    $categoryFilters.find('.filter-btn:not([data-filter="all"])').remove();

    // Render category buttons
    $.each(categories, function (i, category) {
        if (category === "all") return; // Skip 'all'

        // Create button
        const $button = $("<button>", {
            class: "filter-btn",
            "data-filter": category,
            text: capitalizeFirstLetter(category),
        });

        // Add click handler
        $button.on("click", function () {
            $categoryFilters.find(".filter-btn").removeClass("active");
            $(this).addClass("active");
            filterServices(category);
        });

        $categoryFilters.append($button);
    });

    // Add event listener to 'All Services' button
    $categoryFilters.find('[data-filter="all"]').on("click", function () {
        $categoryFilters.find(".filter-btn").removeClass("active");
        $(this).addClass("active");
        filterServices("all");
    });
}

/**
 * Render services in the container
 */
function renderServices(services) {
    const $container = $("#servicesContainer");

    // Remove existing services and empty states
    $(".service-item").remove();
    $(".empty-state").remove();

    // Show empty state if no services
    if (services.length === 0) {
        const $emptyState = $("<div>", {
            class: "col-12 text-center empty-state py-5",
        }).html(`
            <div class="empty-state-icon mb-3">
                <i class="bi bi-camera fs-1 text-muted"></i>
            </div>
            <h3>No Services Found</h3>
            <p class="empty-state-text text-muted mb-4">We couldn't find any services matching your criteria.</p>
            <button class="btn btn-outline-primary reset-filters-btn">
                <i class="bi bi-arrow-counterclockwise me-2"></i>Reset Filters
            </button>
        `);

        // Add click handler to reset filters button
        $emptyState.find('.reset-filters-btn').on('click', function () {
            $("#categoryFilters").find('[data-filter="all"]').click();
        });

        $container.append($emptyState);
        return;
    }

    // Use document fragment to reduce DOM operations
    const fragment = document.createDocumentFragment();

    // Render each service
    $.each(services, function (i, service) {
        let categoryAttribute = "";
        if (typeof service.category === "string") {
            categoryAttribute = service.category.toLowerCase();
        } else if (Array.isArray(service.category)) {
            categoryAttribute = service.category
                .map((c) => c.toLowerCase())
                .join(" ");
        }

        const $serviceItem = $("<div>", {
            class: "col-md-6 col-lg-4 service-item visible",
            "data-category": categoryAttribute,
        }).html(`
            <div class="service-card">
                <div class="service-image">
                    <img src="${service.image_url ||
            "../assets/images/services/placeholder.jpg"
            }" 
                            alt="${service.title}" class="img-fluid">
                    <div class="service-badge">${capitalizeFirstLetter(
                Array.isArray(service.category)
                    ? service.category[0]
                    : service.category
            )}</div>
                </div>
                <div class="service-body">
                    <h3 class="service-title">${service.title}</h3>
                    <div class="photographer-info">
                        <img src="${service.photographer.profile_image ||
            "../assets/images/default-avatar.jpg"
            }" alt="${service.photographer.name
            }" class="photographer-avatar">
                        <div class="photographer-details">
                            <span class="photographer-name">${service.photographer.name
            }</span>
                            <div class="photographer-rating">
                                <i class="bi bi-star-fill"></i> ${service.photographer.rating || "5.0"
            }
                            </div>
                        </div>
                    </div>
                    <p class="service-text">${service.short_description ||
            truncateText(service.description, 100)
            }</p>
                    <div class="service-meta">
                        <div class="service-price">
                            <i class="bi bi-tag"></i> ${service.price_range || "Price varies"
            }
                        </div>
                        <div class="service-duration">
                            <i class="bi bi-clock"></i> ${service.duration || "Varies"
            }
                        </div>
                    </div>
                    <a href="#" class="btn btn-outline-primary w-100 mt-3 view-service-btn" 
                        data-bs-toggle="modal" data-bs-target="#serviceModal" 
                        data-service-id="${service.id}">View Details</a>
                </div>
            </div>
        `);

        fragment.appendChild($serviceItem[0]);
    });

    $container.append(fragment);
}

/**
 * Filter services by category
 */
function filterServices(filter) {
    $(".service-item").each(function () {
        const serviceElement = $(this);
        const categories = serviceElement.data("category").split(" ");

        if (filter === "all" || categories.includes(filter)) {
            // Use CSS classes for animation
            serviceElement.removeClass("hidden").addClass("visible");
        } else {
            serviceElement.removeClass("visible").addClass("hidden");
        }
    });
}

/**
 * Render service details in modal
 */
function renderServiceDetails(service) {
    // Create content element
    const $content = $("<div>", {
        class: "service-detail-content",
    });

    // Build HTML for service details
    let html = `
        <div class="service-detail-header">
            <div class="service-detail-image">
                <img src="${service.image_url ||
        "../assets/images/services/placeholder.jpg"
        }" 
                     alt="${service.title}" class="img-fluid">
            </div>
            <div class="service-detail-info">
                <h2 class="service-detail-title">${service.title}</h2>
                
                <div class="photographer-profile">
                    <div class="photographer-header">
                        <img src="${service.photographer.profile_image ||
        "../assets/images/default-avatar.jpg"
        }" alt="${service.photographer.name
        }" class="photographer-detail-avatar">
                        <div class="photographer-detail-info">
                            <h5 class="photographer-detail-name">${service.photographer.name
        }</h5>
                            <p class="photographer-detail-location"><i class="bi bi-geo-alt"></i> ${service.photographer.location ||
        "Location not specified"
        }</p>
                            <div class="photographer-detail-rating">
                                <i class="bi bi-star-fill"></i> ${service.photographer.rating || "5.0"
        }
                            </div>
                        </div>
                    </div>
                    <p class="photographer-detail-bio">${service.photographer.bio_excerpt ||
        "Professional photographer on LensLink."
        }</p>
                    <a href="./photographer-detail.html?id=${service.photographer.id
        }" class="btn btn-outline-primary btn-sm">View Photographer Profile</a>
                </div>
                
                <p class="service-detail-description">${service.description}</p>
                
                <div class="service-detail-meta">
                    <div class="meta-item">
                        <div class="meta-icon">
                            <i class="bi bi-tag"></i>
                        </div>
                        <div class="meta-info">
                            <span class="meta-label">Starting Price</span>
                            <span class="meta-value">${service.price_range || "Price varies"
        }</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon">
                            <i class="bi bi-clock"></i>
                        </div>
                        <div class="meta-info">
                            <span class="meta-label">Duration</span>
                            <span class="meta-value">${service.duration || "Varies"
        }</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add features if available
    if (service.features && service.features.length > 0) {
        html += `
            <div class="service-detail-features">
                <h4>What's Included</h4>
                <ul class="feature-list">
                    ${service.features
                .map((feature) => `<li>${feature}</li>`)
                .join("")}
                </ul>
            </div>
        `;
    }

    // Add packages if available
    if (service.packages && service.packages.length > 0) {
        html += `
            <div class="service-detail-packages">
                <h4>Available Packages</h4>
                ${service.packages
                .map(
                    (package) => `
                    <div class="package-card">
                        <h5 class="package-title">${package.title}</h5>
                        <div class="package-price">${package.price}</div>
                        <p class="package-description">${package.description
                        }</p>
                        ${package.features
                            ? `
                            <ul class="package-features">
                                ${package.features
                                .map((feature) => `<li>${feature}</li>`)
                                .join("")}
                            </ul>
                        `
                            : ""
                        }
                    </div>
                `
                )
                .join("")}
            </div>
        `;
    }

    // Add booking call-to-action
    html += `
        <div class="text-center mt-4">
            <a href="./photographer-detail.html?id=${service.photographer.id}" class="btn btn-primary">
                Book This Service
            </a>
        </div>
    `;

    // Set HTML content and append to modal
    $content.html(html);
    $("#serviceModalBody").append($content);
}

/**
 * Helper: Capitalize first letter
 */
function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Helper: Truncate text
 */
function truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

