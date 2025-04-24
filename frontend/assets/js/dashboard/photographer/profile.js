const PhotographerProfile = {
    init: function() {
        
    },

    loadDetailedPhotographerData: function() {
        document.getElementById('profileName').textContent = 'Loading...';
        document.getElementById('profileEmail').textContent = 'loading@example.com';
        document.getElementById('infoName').textContent = 'Loading...';
        document.getElementById('infoEmail').textContent = 'Loading...';
        document.getElementById('infoPhone').textContent = 'Loading...';
        document.getElementById('infoLocation').textContent = 'Loading...';
        document.getElementById('infoSpecialization').textContent = 'Loading...';
        document.getElementById('infoExperience').textContent = 'Loading...';
        document.getElementById('infoBio').textContent = 'Loading...';
        document.getElementById('photographerCategories').innerHTML = `
        <div class="text-center">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

        fetch(`${CONFIG.API.BASE_URL}/photographer/profile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load photographer data');
                }
                return response.json();
            })
            .then(data => {
                console.log("Profile data received:", data); 

                document.getElementById('profileName').textContent = data.name || 'Not set';
                document.getElementById('profileEmail').textContent = data.email || 'Not set';
                document.getElementById('profileMember').textContent = `Member since: ${new Date(data.created_at).toLocaleDateString()}`;

                document.getElementById('infoName').textContent = data.name;
                document.getElementById('infoEmail').textContent = data.email;
                document.getElementById('infoPhone').textContent = data.phone || 'Not provided';
                document.getElementById('infoLocation').textContent = data.location || 'Not provided';
                document.getElementById('infoSpecialization').textContent = data.specialization || 'Not provided';
                document.getElementById('infoExperience').textContent = `${data.experience_years || 0} years`;
                document.getElementById('infoBio').textContent = data.bio || 'No bio provided';

                if (data.profile_image) {
                    document.getElementById('profileImage').src = data.profile_image;
                }


                const categoriesContainer = document.getElementById('photographerCategories');
                const rawCategories = data.categories || [];
                const categories = rawCategories.map(name => ({
                    id: name.toLowerCase().replace(/ /g, '-'),
                    name: name
                }));

                console.log("Processed categories:", categories);

                if (categories.length > 0) {
                    categoriesContainer.innerHTML = categories.map(cat =>
                        `<span class="badge bg-primary me-1 mb-1">${cat.name}</span>`
                    ).join('');
                } else {
                    categoriesContainer.innerHTML = '<p class="text-muted mb-0">No category specified</p>';
                }

                document.getElementById('totalSessions').textContent = data.photoshoot_count || 0;
                document.getElementById('totalReviews').textContent = data.review_count || 0;

                $("#editName").val(data.name || "");
                $("#editEmail").val(data.email || "");
                $("#editPhone").val(data.phone || "");
                $("#editLocation").val(data.location || "");
                $("#editSpecialization").val(data.specialization || "");
                $("#editExperience").val(data.experience_years || 0);
                $("#editBio").val(data.bio || "");

            })
            .catch(error => {
                console.error("Failed to load photographer data", error);
                document.getElementById('profileName').textContent = 'Error loading data';
                document.getElementById('profileEmail').textContent = 'Please try again later';
                document.getElementById('photographerCategories').innerHTML = '<p class="text-danger">Failed to load categories</p>';
            });
    },

    openEditProfileModal: function() {
        fetch(`${CONFIG.API.BASE_URL}/photographer/profile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load photographer profile data');
                }
                return response.json();
            })
            .then(data => {
                $("#editName").val(data.name || "");
                $("#editEmail").val(data.email || "");
                $("#editPhone").val(data.phone || "");
                $("#editLocation").val(data.location || "");
                $("#editSpecialization").val(data.specialization || "");
                $("#editExperience").val(data.experience_years || 0);
                $("#editBio").val(data.bio || "");

                if (data.profile_image) {
                    $("#previewProfileImage").attr("src", data.profile_image);
                } else {
                    $("#previewProfileImage").attr("src", "../../assets/images/default-photographer.jpg");
                }

                const rawCategories = data.categories || [];
                const formattedCategories = rawCategories.map(name => ({
                    id: name.toLowerCase().replace(/ /g, '-'),
                    name: name
                }));
                PhotographerPortfolio.loadCategories(formattedCategories);

                const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
                editProfileModal.show();
            })
            .catch(error => {
                console.error("Failed to load profile data:", error);
                showNotification("Failed to load profile data", "error");
            });
    },

    saveProfileChanges: function() {
        const profileData = {
            name: $("#editName").val(),
            email: $("#editEmail").val(),
            phone: $("#editPhone").val(),
            location: $("#editLocation").val(),
            specialization: $("#editSpecialization").val(),
            experience_years: parseInt($("#editExperience").val(), 10) || 0,
            bio: $("#editBio").val()
        };

        const selectedCategories = [];
        $("input[name='categories[]']:checked").each(function () {
            selectedCategories.push($(this).val());
        });
        profileData.categories = selectedCategories;

        $("#saveProfileBtn").prop("disabled", true).html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Saving...
        `);

        fetch(`${CONFIG.API.BASE_URL}/photographer/profile/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update personal data');
                }
                return response.json();
            })
            .then(data => {
                const profileImageInput = document.getElementById("profileImageUpload");
                if (profileImageInput.files && profileImageInput.files[0]) {
                    return this.uploadProfileImage(profileImageInput.files[0]);
                }
                return data;
            })
            .then(data => {
                bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
                this.loadDetailedPhotographerData();
                showNotification("Personal Information Update Successful", "success");
            })
            .catch(error => {
                console.error("Failed to update personal data:", error);
                showNotification("Failed to update personal data", "error");
            })
            .finally(() => {
                $("#saveProfileBtn").prop("disabled", false).text("Save Changes");
            });
    },

    uploadProfileImage: function(imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        return fetch(`${CONFIG.API.BASE_URL}/photographer/profile/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload avatar');
                }
                return response.json();
            });
    }
};