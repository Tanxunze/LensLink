/* Note: Please use the following standard comment style for each js function so that it can be read and modified by other contributors. -Xunze
* Description: A brief description of the function.
* Input parameter: @param {type} name - description
* Output parameter: @returns {type} - description
*/
let allServices = [];
let categories = [];
const itemsPerPage = 9;
let searchParams = {
    search: '',
    category: 'all',
    min_price: '',
    max_price: '',
    sort: 'newest'
};

$(document).ready(function () {
    loadServices();
    // event listener
    $("#retryButton").on("click", loadServices);
    $("#searchButton").on("click", handleSearch);
    $("#searchInput").on("keypress", function (e) {
        if (e.which === 13) handleSearch();
    });

    $("#advancedSearchToggle").on("click", toggleAdvancedSearch);
    $("#applyFilters").on("click", applyAdvancedFilters);
    $("#resetFilters").on("click", resetFilters);
    $("#sortOptions").on("change", function () {
        searchParams.sort = $(this).val();
    });

    // Update photographer profile link 
    $("#serviceModal").on("show.bs.modal", function (event) {
        const button = $(event.relatedTarget);
        const serviceId = button.data("service-id");
        if (serviceId) {
            loadServiceDetails(serviceId);
        }
    });
});

// Fetch services data from API
function loadServices() {
    $("#servicesLoadingIndicator").removeClass("d-none");
    $("#servicesErrorMessage").addClass("d-none");
    $(".service-item").remove();
    $(".empty-state").remove();

    const queryParams = new URLSearchParams();

    if (searchParams.search) queryParams.append('search', searchParams.search);
    if (searchParams.category && searchParams.category !== 'all') {
        queryParams.append('category', searchParams.category);
    }
    if (searchParams.min_price) queryParams.append('min_price', searchParams.min_price);
    if (searchParams.max_price) queryParams.append('max_price', searchParams.max_price);
    if (searchParams.sort) queryParams.append('sort', searchParams.sort);

    API.getServices(Object.fromEntries(queryParams))
        .then(function (data) {
            allServices = data.services || [];
            extractCategories();
            renderCategoryFilters();
            renderServices(allServices);
            $("#servicesLoadingIndicator").addClass("d-none");

            if (searchParams.search || searchParams.min_price || searchParams.max_price) {
                showSearchResultsCount(allServices.length);
            }
        })
        .catch(function (error) {
            console.error("Error fetching services:", error);
        });
}

function handleSearch() {
    searchParams.search = $("#searchInput").val().trim();
    loadServices();
}

function toggleAdvancedSearch() {
    $("#advancedSearchOptions").toggleClass("d-none");
}

function applyAdvancedFilters() {
    searchParams.min_price = $("#minPrice").val();
    searchParams.max_price = $("#maxPrice").val();
    loadServices();
    $("#advancedSearchOptions").addClass("d-none");
    currentPage = 1;
}

function resetFilters() {
    searchParams = {
        search: '',
        category: 'all',
        min_price: '',
        max_price: '',
        sort: 'newest'
    };

    $("#searchInput").val('');
    $("#minPrice").val('');
    $("#maxPrice").val('');
    $("#sortOptions").val('newest');
    $("#categoryFilters").find('[data-filter="all"]').click();
    $(".search-results-count").remove();

    loadServices();
    $("#advancedSearchOptions").addClass("d-none");
    currentPage = 1;
}

// Load service details from API
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
            $("#serviceModalLabel").text(data.service.title);
            $("#viewPhotographersBtn").attr(
                "href",
                `./photographer-detail.html?id=${data.service.photographer.id}`
            );
            $("#viewPhotographersBtn").text(
                `View ${data.service.photographer.name}'s Profile`
            );
            // debug
            console.log("Service details loaded:", data.service);
            $("#serviceModalFooter").find(".book-now-btn").remove();
            $("#serviceModalFooter").prepend(`
                <a href="./photographer-detail.html?id=${data.service.photographer.id}&service=${serviceId}" 
                   class="btn btn-primary book-now-btn">
                   <i class="bi bi-calendar-check me-1"></i> Book This Service
                </a>
            `);
        })
        .catch(function (error) {
            console.error("Error fetching service details:", error);//debug

            $("#modalLoadingIndicator").addClass("d-none");
            $("#modalErrorMessage").removeClass("d-none");
            $("#modalErrorText").text(errorMessage);
            $("#serviceModalLabel").text("Service Details");
            $("#viewPhotographersBtn").attr("href", "./photographers.html");
            $("#viewPhotographersBtn").text("Browse Photographers");
        });
}

// Extract unique categories from services
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
    categories = Array.from(categorySet);
}

function showSearchResultsCount(count) {
    $(".search-results-count").remove();

    const $resultsInfo = $("<div>", {
        class: "search-results-count text-center mb-4"
    }).html(`
        <p class="text-muted">
            Found <strong>${count}</strong> services matching your search
            <button class="btn btn-sm btn-link reset-search-btn">Clear search</button>
        </p>
    `);

    $resultsInfo.find('.reset-search-btn').on('click', resetFilters);

    $("#servicesContainer").before($resultsInfo);
}

// Render category filter buttons
function renderCategoryFilters() {
    const $categoryFilters = $("#categoryFilters");
    $("#categoryLoadingSpinner").remove();
    $categoryFilters.find('.filter-btn:not([data-filter="all"])').remove();
    $.each(categories, function (i, category) {
        if (category === "all") return; // Skip 'all'
        const $button = $("<button>", {
            class: "filter-btn",
            "data-filter": category,
            text: capitalizeFirstLetter(category),
        });

        // click handler
        $button.on("click", function () {
            $categoryFilters.find(".filter-btn").removeClass("active");
            $(this).addClass("active");
            filterServices(category);
        });

        $categoryFilters.append($button);
    });

    $categoryFilters.find('[data-filter="all"]').on("click", function () {
        $categoryFilters.find(".filter-btn").removeClass("active");
        $(this).addClass("active");
        filterServices("all");
    });
}

// Render services in the container
function renderServices(services) {
    const $container = $("#servicesContainer");

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

        $emptyState.find('.reset-filters-btn').on('click', function () {
            resetFilters();
        });

        $container.append($emptyState);
        return;
    }

    const fragment = document.createDocumentFragment();

    // Render service
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
    totalPages = Math.ceil($(".service-item.visible").length / itemsPerPage);
    currentPage = 1;

    displayCurrentPageServices();
    setupPagination();
}

/**
 * Filter services by category
 * @param {string} filter - The category to filter by, or "all" for all categories
 */
function filterServices(filter) {
    searchParams.category = filter;
    if (searchParams.search || searchParams.min_price || searchParams.max_price) {
        loadServices();
        return;
    }

    $(".service-item").each(function () {
        const serviceElement = $(this);
        const categoryAttr = serviceElement.data("category");

        // debug
        // console.log(`Element: ${serviceElement.find('.service-title').text()}, Category: ${categoryAttr}, Filter: ${filter}`);

        if (filter === "all" || categoryAttr === filter) {
            serviceElement.removeClass("hidden").addClass("visible");
        } else {
            serviceElement.removeClass("visible").addClass("hidden");
        }
    });
    updateEmptyStateVisibility();
}

// Render service details in modal
function renderServiceDetails(service) {
    const $content = $("<div>", {
        class: "service-detail-content",
    });

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
    $content.html(html);
    $("#serviceModalBody").append($content);
}

// Helper functions
function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}


function updateEmptyStateVisibility() {
    $(".empty-state").remove();
    const visibleServices = $(".service-item.visible").length;

    if (visibleServices === 0) {
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

        $emptyState.find('.reset-filters-btn').on('click', function () {
            resetFilters();
        });

        $("#servicesContainer").append($emptyState);
    }
}

function setupPagination() {
    $(".pagination-container").remove();
    
    if (totalPages <= 1) {
        return;
    }
    
    const $paginationContainer = $("<div>", {
        class: "pagination-container text-center mt-5"
    });
    
    const $pagination = $("<nav aria-label='Services pagination'><ul class='pagination justify-content-center'></ul></nav>");
    const $paginationList = $pagination.find(".pagination");
    
    $paginationList.append(`
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `);
    
    for (let i = 1; i <= totalPages; i++) {
        $paginationList.append(`
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }
    
    $paginationList.append(`
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `);
    
    $paginationContainer.append($pagination);
    
    $("#servicesContainer").after($paginationContainer);

    $paginationContainer.find(".page-link").on("click", function(e) {
        e.preventDefault();
        const newPage = $(this).data("page");
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            currentPage = newPage;
            displayCurrentPageServices();
            setupPagination();
            
            $('html, body').animate({ 
                scrollTop: $('.services-grid').offset().top - 100 
            }, 300);
        }
    });
}

function displayCurrentPageServices() {
    const visibleServices = $(".service-item.visible");
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    visibleServices.hide();
    visibleServices.slice(startIndex, endIndex).show();
}