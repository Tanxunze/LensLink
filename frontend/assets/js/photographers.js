let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    min_rating: '',
    sort_by: 'average_rating',
    sort_direction: 'desc',
    per_page: 9
};

let categoryOptions = [];
let sortOptions = [];
let ratingOptions = [];

// Initialize the page when DOM is ready
$(document).ready(function () {
    // Show loading indicator
    showLoading();
    initializeFilterOptions()
        .then(() => {
            loadPhotographers();
            setupEventHandlers();
        })
        .catch(error => {
            showError("Failed to initialize page. Please reload.");
            console.error('Initialization error:', error);
        });
});

/**
 * Load filter options from API
 * @returns {Promise} - Promise resolved when all options are loaded
 */
function initializeFilterOptions() {
    return Promise.all([
        loadCategoryOptions(),
        loadSortOptions(),
        loadRatingOptions()
    ]);
}

/**
 * Load categories from API and populate dropdown
 * @returns {Promise}
 */
function loadCategoryOptions() {
    return API.getCategories()
        .then(categories => {
            categoryOptions = categories;
            const $select = $("#categoryFilter");

            // Empty dropdown except the first "All Categories" option
            $select.find('option:not(:first)').remove();

            // Add categories to dropdown
            categories.forEach(category => {
                $select.append(`<option value="${category.slug}">${category.name}</option>`);
            });
        })
        .catch(error => {
            console.error('Failed to load categories:', error);
            // // debug
            // const defaultCategories = [
            //     { slug: 'wedding', name: 'Wedding' },
            //     { slug: 'portrait', name: 'Portrait' },
            //     { slug: 'event', name: 'Event' },
            //     { slug: 'commercial', name: 'Commercial' },
            //     { slug: 'landscape', name: 'Landscape' }
            // ];

            // const $select = $("#categoryFilter");
            // defaultCategories.forEach(category => {
            //     $select.append(`<option value="${category.slug}">${category.name}</option>`);
            // });
        });
}

/**
 * Load sort options from API and populate dropdown
 * @returns {Promise}
 */
function loadSortOptions() {
    return API.getSortOptions('photographers')
        .then(options => {
            sortOptions = options;
            const $select = $("#sortFilter");
            $select.empty();
            options.forEach(option => {
                $select.append(`<option value="${option.value}">${option.label}</option>`);
            });
            $select.val('rating_desc');
        })
        .catch(error => {
            console.error('Failed to load sort options:', error);
            // // Fallback to default options if API fails
            // const defaultOptions = [
            //     { value: 'rating_desc', label: 'Highest Rated' },
            //     { value: 'price_asc', label: 'Price: Low to High' },
            //     { value: 'price_desc', label: 'Price: High to Low' },
            //     { value: 'experience_desc', label: 'Most Experienced' },
            //     { value: 'reviews_desc', label: 'Most Reviewed' }
            // ];

            // const $select = $("#sortFilter");
            // defaultOptions.forEach(option => {
            //     $select.append(`<option value="${option.value}">${option.label}</option>`);
            // });

            // // Select default sort option
            // $select.val('rating_desc');
        });
}

/**
 * Load rating filter options from API and populate dropdown
 * @returns {Promise}
 */
function loadRatingOptions() {
    return API.getRatingOptions()
        .then(options => {
            ratingOptions = options;
            const $select = $("#ratingFilter");
            $select.find('option:not(:first)').remove();
            options.forEach(option => {
                $select.append(`<option value="${option.value}">${option.label}</option>`);
            });
        })
        .catch(error => {
            console.error('Failed to load rating options:', error);
            // debug
            // const defaultOptions = [
            //     { value: '4.5', label: '4.5+ ⭐' },
            //     { value: '4', label: '4.0+ ⭐' },
            //     { value: '3.5', label: '3.5+ ⭐' },
            //     { value: '3', label: '3.0+ ⭐' }
            // ];

            // const $select = $("#ratingFilter");
            // defaultOptions.forEach(option => {
            //     $select.append(`<option value="${option.value}">${option.label}</option>`);
            // });
        });
}

// Setup all event handlers for the page
function setupEventHandlers() {
    // Search button click handler
    $("#searchBtn").on("click", function () {
        currentFilters.search = $("#searchInput").val();
        currentPage = 1;
        loadPhotographers();
    });

    // Search input enter key handler
    $("#searchInput").on("keypress", function (e) {
        if (e.which === 13) {
            currentFilters.search = $(this).val();
            currentPage = 1;
            loadPhotographers();
        }
    });

    // Category filter change handler
    $("#categoryFilter").on("change", function () {
        currentFilters.category = $(this).val();
        currentPage = 1;
        loadPhotographers();
    });

    // Toggle advanced filters
    $("#toggleFiltersBtn").on("click", function () {
        $("#advancedFilters").toggleClass("d-none");
    });

    // Apply filters button handler
    $("#applyFiltersBtn").on("click", function () {
        currentFilters.min_price = $("#minPrice").val();
        currentFilters.max_price = $("#maxPrice").val();
        currentFilters.min_rating = $("#ratingFilter").val();
        const sortValue = $("#sortFilter").val();
        if (sortValue) {
            const [field, direction] = sortValue.split('_');
            let sortBy = 'average_rating';
            if (field === 'price') sortBy = 'starting_price';
            else if (field === 'experience') sortBy = 'experience_years';
            else if (field === 'reviews') sortBy = 'review_count';

            currentFilters.sort_by = sortBy;
            currentFilters.sort_direction = direction;
        }

        currentPage = 1;
        loadPhotographers();
    });

    // Reset filters
    $("#resetFiltersBtn").on("click", function () {
        resetFilters();
    });

    // Retry button handler
    $("#retryBtn").on("click", function () {
        loadPhotographers();
    });
}

// Reset all filters to default values
function resetFilters() {
    $("#searchInput").val('');
    $("#categoryFilter").val('');
    $("#minPrice").val('');
    $("#maxPrice").val('');
    $("#ratingFilter").val('');
    $("#sortFilter").val('rating_desc');

    currentFilters = {
        search: '',
        category: '',
        min_price: '',
        max_price: '',
        min_rating: '',
        sort_by: 'average_rating',
        sort_direction: 'desc',
        per_page: 9
    };

    currentPage = 1;
    loadPhotographers();
}

// Load photographers from API based on current filters
function loadPhotographers() {
    showLoading();
    hideMessages();
    const params = { ...currentFilters, page: currentPage };
    API.getPhotographers(params)
        .then(function (response) {
            hideLoading();
            displayPhotographers(response.data);

            if (response.pagination) {
                totalPages = response.pagination.last_page;
                updatePagination(response.pagination);
            }
        })
        .catch(function (error) {
            hideLoading();
            showError("Failed to load photographers. Please try again.");
            console.error('Failed to load photographers:', error);
        });
}

/**
 * Display photographers in the list
 * @param {Array} photographers - Array of photographer objects
 */
function displayPhotographers(photographers) {
    // Handle empty results
    if (!photographers || photographers.length === 0) {
        $("#photographersList").empty();
        $("#noResultsMessage").removeClass("d-none");
        return;
    }

    $("#photographersList").empty();
    photographers.forEach(photographer => {
        const template = document.getElementById('photographerCardTemplate');
        const clone = document.importNode(template.content, true);

        // Set photographer data
        const card = clone.querySelector('.card');
        const featuredBadge = clone.querySelector('.featured-badge');
        const image = clone.querySelector('.photographer-image');
        const name = clone.querySelector('.photographer-name');
        const specialization = clone.querySelector('.photographer-specialization');
        const rating = clone.querySelector('.photographer-rating');
        const description = clone.querySelector('.photographer-description');
        const price = clone.querySelector('.photographer-price');
        const profileBtn = clone.querySelector('.view-profile-btn');

        if (photographer.featured) {
            featuredBadge.classList.remove('d-none');
            featuredBadge.innerHTML = '<i class="bi bi-star-fill me-1"></i> Featured';
            card.classList.add('border-primary');
        }

        image.src = photographer.image || '../assets/images/default-photographer.jpg';
        image.alt = photographer.name;

        // Set text content
        name.textContent = photographer.name;
        specialization.textContent = photographer.specialization;

        // Generate star rating
        rating.innerHTML = generateStarRating(photographer.rating);
        rating.querySelector('.rating-text').textContent = `(${photographer.rating})`;

        description.textContent = truncateText(photographer.description, 100);

        price.textContent = `From €${photographer.startingPrice}/hour`;

        profileBtn.href = `photographer-detail.html?id=${photographer.id}`;

        $("#photographersList").append(clone);
    });
}

/**
 * Generate HTML for star rating
 * @param {number} rating - Rating value (0-5)
 * @returns {string} HTML for star rating
 */
function generateStarRating(rating) {
    return $.lenslink.generateStarRating(rating) +
        '<span class="ms-1 rating-text"></span>';
}

/**
 * Update pagination controls
 * @param {Object} pagination - Pagination information from API
 */
function updatePagination(pagination) {
    const ul = $("#pagination");
    ul.empty();

    // For optimization
    if (pagination.last_page <= 1) {
        return;
    }

    ul.append(`
        <li class="page-item ${pagination.current_page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${pagination.current_page - 1}">Previous</a>
        </li>
    `);

    // Page numbers
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.last_page, pagination.current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
        ul.append(`
            <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }

    // Next button
    ul.append(`
        <li class="page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${pagination.current_page + 1}">Next</a>
        </li>
    `);

    // click handlers
    $(".page-link").on("click", function (e) {
        e.preventDefault();

        if ($(this).parent().hasClass('disabled')) {
            return;
        }

        currentPage = parseInt($(this).data('page'));
        loadPhotographers();

        // Scroll to top of results
        $('html, body').animate({
            scrollTop: $("#photographersList").offset().top - 100
        }, 200);
    });
}

/**
 * Truncate text to specified length and add ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length of text
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ?
        text.substring(0, maxLength) + '...' :
        text;
}

// Show loading indicator
function showLoading() {
    $("#loadingIndicator").removeClass("d-none");
    $("#photographersList").html(''); // Clear current results
}

// Hide loading indicator
function hideLoading() {
    $("#loadingIndicator").addClass("d-none");
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    $("#errorText").text(message);
    $("#errorMessage").removeClass("d-none");
}

/**
 * Hide all status messages (loading, error, no results)
 */
function hideMessages() {
    $("#errorMessage").addClass("d-none");
    $("#noResultsMessage").addClass("d-none");
}