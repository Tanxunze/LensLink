const PhotographerServices = {
    init: function () {
        $(document).on('click', '#serviceImageBtn', function() {
            $('#serviceImageUpload').click();
        });

        $(document).on('change', '#serviceImageUpload', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                previewImage(file, "serviceImagePreview");
                $(this).data('imageFile', file);
            }
        });

        $('#addServiceModal').on('hidden.bs.modal', function () {
            $("#serviceImagePreview").attr("src", "../../assets/images/placeholder.jpg");
            $("#serviceImagePath").val("");
            $("#serviceImageUpload").val("").removeData('imageFile');
        });
    },

    loadServices: function (onlyFeatured = false) {
        $("#servicesList").html(`
            <div class="col-12 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading services...</p>
            </div>
        `);

        const requestData = {
            filter: {
                is_featured: onlyFeatured ? 1 : null,
                is_active: 1
            }
        };

        fetch(`${CONFIG.API.BASE_URL}/photographer/services`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load services. Please try again later.');
                }
                return response.json();
            })
            .then(data => {
                if (!data || data.length === 0) {
                    $("#servicesList").html(`
                        <div class="col-12">
                            <div class="alert alert-info">
                                No services found. Add some services to attract clients.
                            </div>
                        </div>
                    `);
                    return;
                }

                const serviceHtml = data.map(service => {
                    const featuresHtml = service.features && service.features.length > 0 ?
                        `
                            <ul class="list-group list-group-flush mt-3">
                                ${service.features.map(feature => `
                                    <li class="list-group-item d-flex align-items-center">
                                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                                        ${feature}
                                    </li>
                                `).join('')}
                            </ul>
                        ` : '';

                    const unitDisplay = this.formatServiceUnit(service.unit, service.duration);

                    return `
                        <div class="col-md-4 mb-4">
                            <div class="card service-card" style="height: 500px; overflow: visible;">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">${service.name}</h5>
                                    <div class="dropdown" style="position: static;">
                                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            <i class="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end" style="position: absolute; z-index: 1050;">
                                            <li><a class="dropdown-item edit-service-btn" href="#" data-id="${service.id}">
                                                <i class="bi bi-pencil me-2"></i> Edit
                                            </a></li>
                                            <li><a class="dropdown-item ${service.is_featured ? 'unfeature-service-btn' : 'feature-service-btn'}" href="#" data-id="${service.id}">
                                                <i class="bi bi-star${service.is_featured ? '-fill' : ''} me-2"></i> 
                                                ${service.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                                            </a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item text-danger delete-service-btn" href="#" data-id="${service.id}">
                                                <i class="bi bi-trash me-2"></i> Delete
                                            </a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="card-body" style="overflow-y: auto;">
                                    ${service.image_url ? `
                                        <div class="service-image-container mb-3">
                                            <img src="${service.image_url}" class="img-fluid rounded" alt="${service.name}">
                                        </div>
                                    ` : ''}
                                    <h6 class="price-tag">€${parseFloat(service.price).toFixed(2)} <small class="text-muted">/ ${unitDisplay}</small></h6>
                                    <p class="card-text">${service.description || 'No description provided.'}</p>
                                    ${featuresHtml}
                                </div>
                                <div class="card-footer bg-white">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">Last updated: ${formatDate(service.updated_at)}</small>
                                        ${service.is_featured ? '<span class="badge bg-warning">Featured</span>' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                $("#servicesList").html(serviceHtml);
            })
            .catch(error => {
                console.error("Failed to load services:", error);
                $("#servicesList").html(`
                    <div class="col-12">
                        <div class="alert alert-danger">
                            Failed to load services. Please try again.
                        </div>
                    </div>
                `);
            });
    },

    formatServiceUnit: function (unit, duration) {
        switch (unit) {
            case 'hour':
                return 'hour';
            case 'session':
                return duration ? `session (${Math.floor(duration / 60)}h ${duration % 60 > 0 ? duration % 60 + 'min' : ''})` : 'session';
            case 'package':
                return 'package';
            case 'day':
                return 'day';
            default:
                return unit || 'session';
        }
    },

        openAddServiceModal: function () {
            
            $("#addServiceForm")[0].reset();
            $("#serviceImagePreview").attr("src", "../../assets/images/placeholder.jpg");
            $("#serviceImagePath").val("");
            $("#serviceImageUpload").val("").removeData('imageFile');

            $("#addServiceModal .modal-title").text("Add New Service");
            $("#saveServiceBtn").removeData("id").text("Save Service");

            $("#serviceFeatures").html(`
            <div class="input-group mb-2">
                <input type="text" class="form-control" placeholder="e.g., 2-hour photoshoot" name="features[]">
                <button class="btn btn-outline-secondary remove-feature" type="button">
                    <i class="bi bi-dash"></i>
                </button>
            </div>
        `);

            this.setupRemoveFeatureButtons();

            
            const serviceModal = new bootstrap.Modal(document.getElementById('addServiceModal'));
            serviceModal.show();
        },

    setupRemoveFeatureButtons: function () {
        $(".remove-feature").off('click').on('click', function () {

            if ($("#serviceFeatures .input-group").length === 1) {
                $(this).closest(".input-group").find("input").val("");
                return;
            }

            $(this).closest(".input-group").remove();
        });
    },

    addServiceFeatureInput: function () {
        const newFeatureInput = `
            <div class="input-group mb-2">
                <input type="text" class="form-control" placeholder="e.g., Digital delivery" name="features[]">
                <button class="btn btn-outline-secondary remove-feature" type="button">
                    <i class="bi bi-dash"></i>
                </button>
            </div>
        `;

        $("#serviceFeatures").append(newFeatureInput);
        this.setupRemoveFeatureButtons();
    },

    saveService: function () {
        const name = $("#serviceName").val();
        const description = $("#serviceDescription").val();
        const price = $("#servicePrice").val();
        const unit = $("#serviceUnit").val();
        const duration = $("#serviceDuration").val();
        const featured = $("#serviceFeatured").is(":checked");
        const imageFile = $("#serviceImageUpload").data('imageFile');
        const originalImageUrl = $("#serviceImagePath").val();

        const features = [];
        $("#serviceFeatures input").each(function () {
            const feature = $(this).val().trim();
            if (feature) {
                features.push(feature);
            }
        });

        if (!name || !price || !unit) {
            alert("Please fill in all required fields");
            return;
        }

        const saveBtn = $("#saveServiceBtn");
        const originalText = saveBtn.text();
        saveBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');

        const serviceId = saveBtn.data("id");
        const isEdit = !!serviceId;

        
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);

            fetch(`${CONFIG.API.BASE_URL}/photographer/services/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        
                        this.submitServiceData(isEdit, serviceId, name, description, price, unit, duration, featured, features, data.image_url, saveBtn, originalText);
                    } else {
                        throw new Error('Image upload failed: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error("Image upload failed:", error);
                    showNotification("Failed to upload image. Service not saved.", "error");
                    saveBtn.prop("disabled", false).text(originalText);
                });
        } else {
            
            this.submitServiceData(isEdit, serviceId, name, description, price, unit, duration, featured, features, originalImageUrl, saveBtn, originalText);
        }
    },


    submitServiceData: function(isEdit, serviceId, name, description, price, unit, duration, featured, features, imageUrl, saveBtn, originalText) {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit
            ? `${CONFIG.API.BASE_URL}/photographer/services/edit/${serviceId}`
            : `${CONFIG.API.BASE_URL}/services`;

        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                description: description,
                price: price,
                unit: unit,
                duration: duration,
                is_featured: featured,
                features: features,
                image_url: imageUrl
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save service');
                }
                return response.json();
            })
            .then(data => {
                bootstrap.Modal.getInstance(document.getElementById('addServiceModal')).hide();
                showNotification(`Service ${isEdit ? 'updated' : 'added'} successfully`, "success");
                this.loadServices();
            })
            .catch(error => {
                console.error("Failed to save service:", error);
                showNotification("Failed to save service. Please try again.", "error");
            })
            .finally(() => {
                saveBtn.prop("disabled", false).text(originalText);
            });
    },

    openEditServiceModal: function (serviceId) {
        
        $("#addServiceForm")[0].reset();
        $("#serviceImagePreview").attr("src", "../../assets/images/placeholder.jpg");
        $("#serviceImagePath").val("");
        $("#serviceImageUpload").val("").removeData('imageFile');

        $("#addServiceModal .modal-title").text("Edit Service");
        $("#saveServiceBtn").data("id", serviceId).text("Save Changes");

        $("#addServiceModal .modal-body").prepend(`
        <div id="loadingIndicator" class="text-center mb-3">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div> 
            <span>Loading services...</span>
        </div>
    `);

        const serviceModal = new bootstrap.Modal(document.getElementById('addServiceModal'));
        serviceModal.show();

        $("#addServiceForm").hide();

        fetch(`${CONFIG.API.BASE_URL}/photographer/services/edit/${serviceId}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load service details');
                }
                return response.json();
            })
            .then(service => {
                $("#loadingIndicator").remove();

                $("#addServiceForm")[0].reset();
                $("#addServiceForm").show();

                $("#serviceName").val(service.name);
                $("#serviceDescription").val(service.description);
                $("#servicePrice").val(service.price);
                $("#serviceUnit").val(service.unit);
                $("#serviceDuration").val(service.duration);
                $("#serviceFeatured").prop("checked", service.is_featured);

                if (service.image_url) {
                    $("#serviceImagePreview").attr("src", service.image_url);
                    $("#serviceImagePath").val(service.image_url);
                }

                $("#serviceFeatures").empty();
                if (service.features && service.features.length > 0) {
                    service.features.forEach(featureObj => {
                        const featureInput = `
                    <div class="input-group mb-2">
                        <input type="text" class="form-control" placeholder="e.g., Digital delivery" name="features[]" value="${featureObj.feature}">
                        <button class="btn btn-outline-secondary remove-feature" type="button">
                            <i class="bi bi-dash"></i>
                        </button>
                    </div>
                `;
                        $("#serviceFeatures").append(featureInput);
                    });
                } else {
                    const emptyFeatureInput = `
                <div class="input-group mb-2">
                    <input type="text" class="form-control" placeholder="e.g., Digital delivery" name="features[]">
                    <button class="btn btn-outline-secondary remove-feature" type="button">
                        <i class="bi bi-dash"></i>
                    </button>
                </div>
            `;
                    $("#serviceFeatures").append(emptyFeatureInput);
                }

                this.setupRemoveFeatureButtons();
            })
            .catch(error => {
                console.error("Failed to load service details:", error);
                showNotification("Failed to load service details. Please try again.", "error");
            });
    },

    updateServiceFeatured: function (serviceId, isFeatured) {
        const btn = $(`.${isFeatured ? 'feature-service-btn' : 'unfeature-service-btn'}[data-id="${serviceId}"]`);
        const originalHtml = btn.html();

        btn.html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ${isFeatured ? 'Setting as Featured...' : 'Setting as Unfeatured...'}
        `).prop("disabled", true);

        fetch(`${CONFIG.API.BASE_URL}/photographer/services/${serviceId}/featured`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_featured: isFeatured ? 1 : 0
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update service featured status');
                }
                return response.json();
            })
            .then(data=>{
                showNotification(isFeatured? "Service marked as featured" : "Service unmarked as featured", "success");
                this.loadServices();
            })
            .catch(error => {
                console.error("Failed to load service details:", error);
                showNotification("Failed to load service details. Please try again.", "error");
                btn.html(originalHtml).prop("disabled", false);
            })
    },

    uploadServiceImage: function(imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        return fetch(`${CONFIG.API.BASE_URL}/photographer/services/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload service image');
                }
                return response.json();
            });
    },

    deleteService: function (serviceId) {
        if(!confirm("Are you sure you want to delete this service? This operation is irreversible")) {
            return;
        }

        const btn=$(`.delete-service-btn[data-id="${serviceId}"]`);
        const card=btn.closest(".card").parent();
        const originalHtml=btn.html();
        btn.html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Deleting...
        `).prop("disabled", true);

        fetch(`${CONFIG.API.BASE_URL}/photographer/services/${serviceId}/delete`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete service');
                }
                return response.json();
            })
            .then(data=>{
                card.fadeOut(300, function () {
                    $(this).remove();
                    if($("#servicesList .service-card").length===0) {
                        $("#servicesList").html(`
                            <div class="col-12">
                                <div class="alert alert-info">
                                    No services found. Add some services to attract clients.
                                </div>
                            </div>
                        `);
                    }
                });

                showNotification("Service deleted", "success");
            })
            .catch(error => {
                console.error("Failed to delete service:", error);
                showNotification("Failed to delete service. Please try again.", "error");
                btn.html(originalHtml).prop("disabled", false);
            })
    }
};