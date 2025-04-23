const PhotographerPortfolio = {
    init: function() {
        
    },

    filterPortfolioItems: function(category) {
        lastSelectedCategory = category;
        this.loadPortfolio(category);
    },

    loadPortfolio: function(category = 'all') {
        $('#portfolioItems').html(`
            <div class="col-12 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading portfolio...</p>
            </div>
        `);

        const requestData = {
            category: category
        };

        fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load portfolio');
                }
                return response.json();
            })
            .then(data => {
                if (!data || data.length === 0) {
                    $("#portfolioItems").html(`
                        <div class="col-12">
                            <div class="alert alert-info">
                                No Portfolio found. Please try again later.
                            </div>
                        </div>
                    `);
                    return;
                }

                const portfolioItemHtml = data.map(item => {

                    return `
                    <div class="col-md-3 mb-4 portfolio-item" data-category="${item.category}">
                        <div class="card h-100">
                            <div class="portfolio-image-container">
                                <img src="${item.image_path}" class="card-img-top" alt="${item.title}">
                                <div class="overlay">
                                    <button class="btn btn-sm btn-light view-portfolio-btn me-5" data-id="${item.id}">
                                        <i class="bi bi-eye"></i> View
                                    </button>
                                    <button class="btn btn-sm btn-light edit-portfolio-btn" data-id="${item.id}">
                                        <i class="bi bi-pencil"></i> Edit
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${item.title}</h5>
                                <p class="card-text text-muted small">${formatDate(item.created_at)}</p>
                            </div>
                            <div class="card-footer bg-white">
                                <span class="badge bg-primary">${capitalizeFirstLetter(item.category)}</span>
                                ${item.featured ? '<span class="badge bg-warning ms-1">Featured</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
                }).join('');

                $("#portfolioItems").html(portfolioItemHtml);

                $(".view-portfolio-btn").click(function () {
                    const itemId = $(this).data("id");
                    PhotographerPortfolio.viewPortfolioItem(itemId);
                });
                $(".edit-portfolio-btn").click(function () {
                    const itemId = $(this).data("id");
                    PhotographerPortfolio.editPortfolioItem(itemId);
                });
            })
            .catch(error => {
                console.error("Failed to load portfolio:", error);
                $("#portfolioItems").html(`
                    <div class="col-12">
                        <div class="alert alert-danger">
                            Failed to load portfolio items. Please try again.
                        </div>
                    </div>
                `);
            })
    },

    loadCategories: function() {
        console.log("Loading categories...");

        fetch(`${CONFIG.API.BASE_URL}/categories`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log("Categories API response status:", response.status);
                if (!response.ok) {
                    throw new Error(`Failed to load categories: ${response.status}`);
                }
                return response.json();
            })
            .then(categories => {
                console.log("Categories loaded:", categories.length);

                let categoryButtons = $(".btn-group[role='group'][aria-label='Portfolio categories']");

                console.log("Category buttons container found:", categoryButtons.length > 0);

                if (categoryButtons.length === 0) {
                    console.warn("Trying alternative selector for category buttons");
                    categoryButtons = $(".btn-group").filter(function() {
                        return $(this).find("button[data-category]").length > 0;
                    });

                    if (categoryButtons.length === 0) {
                        console.error("Could not find category buttons container!");
                        return;
                    }
                }

                categoryButtons.empty();
                console.log("Cleared existing category buttons");

                categoryButtons.append(`
                <button type="button" class="btn btn-outline-primary active" data-category="all">All</button>
            `);

                categories.forEach(category => {
                    categoryButtons.append(`
                    <button type="button" class="btn btn-outline-primary" 
                            data-category="${category.slug}">${category.name}</button>
                `);
                });

                console.log("Added category buttons:", categories.length + 1);

                $("button[data-category]").off('click').on('click', function() {
                    const category = $(this).data("category");
                    console.log("Category selected:", category);

                    $("button[data-category]").removeClass("active");
                    $(this).addClass("active");
                    lastSelectedCategory = category;
                    PhotographerPortfolio.filterPortfolioItems(category);
                });

                const categorySelect = $("#portfolioCategory");
                categorySelect.empty();
                categorySelect.append('<option value="">Select category</option>');

                categories.forEach(category => {
                    categorySelect.append(`<option value="${category.id}">${category.name}</option>`);
                });

                console.log("Category dropdown updated with", categories.length, "options");
            })
            .catch(error => {
                console.error("Failed to load categories:", error);
            });
    },

    viewPortfolioItem: function(itemId) {
        console.log("ItemID: ", itemId);
        if (!document.getElementById('portfolioDetailModal')) {
            const modalHtml = `
                <div class="modal fade" id="portfolioDetailModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Portfolio Details</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body text-center">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p>Loading portfolio details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioDetailModal'));
        portfolioModal.show();

        const requestData = {
            portfolio_id: itemId
        }

        fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load portfolio details');
                }
                return response.json();
            })
            .then(data => {
                const item = Array.isArray(data) ? data[0] : data;
                const modalBody = document.querySelector('#portfolioDetailModal .modal-body');
                modalBody.innerHTML = `
                    <div class="row">
                        <div class="col-md-8">
                            <img src="${item.image_path}" class="img-fluid rounded" alt="${item.title}">
                        </div>
                        <div class="col-md-4 text-start">
                            <h4>${item.title}</h4>
                            <div class="mb-3">
                                <span class="badge bg-primary">${capitalizeFirstLetter(item.category)}</span>
                                ${item.featured ? '<span class="badge bg-warning ms-1">Featured</span>' : ''}
                            </div>
                            <p>${item.description || 'No description provided.'}</p>
                            <small class="text-muted">Added on: ${formatDate(item.created_at)}</small>
                        </div>
                    </div>
                `;
            })
            .catch(error => {
                console.error("Failed to load portfolio details: ", error);
                document.querySelector('#portfolioDetailModal .modal-body').innerHTML = `
                    <div class="alert alert-danger">
                        Failed to load portfolio item details. Please try again.
                    </div>
                `;
            });
    },

    openAddPortfolioModal: function() {
        $("#addPortfolioForm")[0].reset();
        $("#portfolioPreview").attr("src", "../../assets/images/placeholder.jpg");

        const portfolioModal = new bootstrap.Modal(document.getElementById('addPortfolioModal'));
        portfolioModal.show();
    },

    editPortfolioItem: function(itemId) {
        $("#addPortfolioForm")[0].reset();

        $("#addPortfolioModal .modal-title").text("Edit portfolio");
        $("#savePortfolioBtn").text("Save changes").data("edit-mode", true).data("item-id", itemId);

        $("#portfolioPreview").attr("src", "../../assets/images/placeholder.jpg").css("opacity", "0.5");

        this.loadCategories();

        fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({portfolio_id: itemId})
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load portfolio item');
                }
                return response.json();
            })
            .then(data => {
                const item = Array.isArray(data) ? data[0] : data;

                $("#portfolioTitle").val(item.title);
                $("#portfolioDescription").val(item.description || '');
                $("#portfolioFeatured").prop("checked", item.featured);

                if (item.image_path) {
                    $("#portfolioPreview").attr("src", item.image_path).css("opacity", "1");
                }

                $("#savePortfolioBtn").data("original-image", item.image_path);

                let categoryFound = false;
                $("#portfolioCategory option").each(function() {
                    if ($(this).text() === item.category) {
                        $("#portfolioCategory").val($(this).val());
                        categoryFound = true;
                        return false;
                    }
                });

                if (!categoryFound && item.category) {
                    $("#portfolioCategory").append(`<option value="${item.category}" selected>${item.category}</option>`);
                }

                const portfolioModal = new bootstrap.Modal(document.getElementById('addPortfolioModal'));
                portfolioModal.show();
            })
            .catch(error => {
                console.error("Failed to load portfolio item details:", error);
                showNotification("Failed to load portfolio items", "error");
            });
    },

    savePortfolioItem: function() {
        const editMode = $("#savePortfolioBtn").data("edit-mode") || false;
        const itemId = $("#savePortfolioBtn").data("item-id");
        const originalImage = $("#savePortfolioBtn").data("original-image");

        const title = $("#portfolioTitle").val();
        const category = $("#portfolioCategory").val();
        const description = $("#portfolioDescription").val();
        const featured = $("#portfolioFeatured").is(":checked");
        const imageFile = $("#portfolioImageUpload")[0].files[0];

        if (!title || !category) {
            showNotification("Please fill in all required fields", "warning");
            return;
        }

        const saveBtn = $("#savePortfolioBtn");
        const originalText = saveBtn.text();
        saveBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 保存中...');

        if (editMode && !imageFile) {
            this.updatePortfolioWithoutNewImage(itemId, title, category, description, originalImage, featured, saveBtn, originalText);
        } else {
            this.uploadPortfolioImage(imageFile)
                .then(response => {
                    if (!response.success) {
                        throw new Error(response.message || 'Failed to upload image');
                    }

                    if (editMode) {
                        return this.updatePortfolioWithNewImage(itemId, title, category, description, response.image_url, featured);
                    } else {
                        return this.createNewPortfolio(title, category, description, response.image_url, featured);
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to ${editMode ? 'Update' : 'Save'} portfolio item`);
                    }
                    return response.json();
                })
                .then(data => {
                    bootstrap.Modal.getInstance(document.getElementById('addPortfolioModal')).hide();
                    showNotification(`Portfolio item ${editMode ? 'update' : 'add'} successfully功`, "success");
                    this.loadPortfolio(lastSelectedCategory);
                    this.resetPortfolioModal();
                })
                .catch(error => {
                    console.error(`Failed to ${editMode ? 'update' : 'save'} portfolio item:`, error);
                    showNotification(`Failed to ${editMode ? 'update' : 'save'} portfolio item`, "error");
                })
                .finally(() => {
                    saveBtn.prop("disabled", false).text(originalText);
                });
        }
    },

    updatePortfolioWithoutNewImage: function(itemId, title, category, description, originalImage, featured, saveBtn, originalText) {
        fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: itemId,
                title: title,
                category_id: category,
                description: description,
                featured: featured,
                image_path: originalImage
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update portfolio item');
                }
                return response.json();
            })
            .then(data => {
                bootstrap.Modal.getInstance(document.getElementById('addPortfolioModal')).hide();
                showNotification("Portfolio item Updated Successfully", "success");
                this.loadPortfolio(lastSelectedCategory);
                this.resetPortfolioModal();
            })
            .catch(error => {
                console.error("Failed to update portfolio item:", error);
                showNotification("Failed to update portfolio item, please try again", "error");
            })
            .finally(() => {
                saveBtn.prop("disabled", false).text(originalText);
            });
    },

    updatePortfolioWithNewImage: function(itemId, title, category, description, imageUrl, featured) {
        return fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: itemId,
                title: title,
                category_id: category,
                description: description,
                image_path: imageUrl,
                featured: featured
            })
        });
    },

    createNewPortfolio: function(title, category, description, imageUrl, featured) {
        return fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                category_id: category,
                description: description,
                image_path: imageUrl,
                featured: featured
            })
        });
    },

    resetPortfolioModal: function() {
        $("#addPortfolioModal .modal-title").text("Add Portfolio Item");
        $("#savePortfolioBtn").text("Save Item")
            .removeData("edit-mode")
            .removeData("item-id")
            .removeData("original-image");
        $("#portfolioPreview").attr("src", "../../assets/images/placeholder.jpg");
        $("#addPortfolioForm")[0].reset();
    },

    uploadPortfolioImage: function(imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        return fetch(`${CONFIG.API.BASE_URL}/photographer/portfolio/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload portfolio image');
                }
                return response.json();
            });
    }
};