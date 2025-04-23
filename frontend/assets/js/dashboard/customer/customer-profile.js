const CustomerProfile = {
    init: function() {
        this.setupEventHandlers();
    },

    setupEventHandlers: function() {
        $("#editProfileBtn").click(function (e) {
            e.preventDefault();
            CustomerProfile.openEditProfileModal();
        });

        $("#uploadProfileImageBtn").click(function () {
            $("#profileImageUpload").click();
        });

        $("#profileImageUpload").change(function () {
            if (this.files && this.files[0]) {
                CustomerProfile.previewImage(this.files[0], "previewProfileImage");
            }
        });

        $("#saveProfileBtn").click(function () {
            CustomerProfile.saveProfileChanges();
        });

        $("#profileImageUpload").on("change", function (e) {
            if ($(this).data("direct-upload") === "true") {
                if (this.files && this.files[0]) {
                    $("#profileImage").css("opacity", "0.5");
                    $(".profile-image-container .overlay").append(
                        '<div class="upload-spinner"><div class="spinner-border spinner-border-sm text-light" role="status"></div></div>'
                    );

                    const formData = new FormData();
                    formData.append("image", this.files[0]);

                    API.updateProfileImage(formData)
                        .then(response => {
                            if (response.user && response.user.profile_image) {
                                $("#profileImage").attr("src", response.user.profile_image);
                                $("#previewProfileImage").attr("src", response.user.profile_image);
                            }
                            showNotification("Updated successfully", "success");
                        })
                        .catch(error => {
                            console.error("Upload failed:", error);
                            showNotification("Upload failed", "error");
                        })
                        .finally(() => {
                            $("#profileImage").css("opacity", "1");
                            $(".profile-image-container .overlay .upload-spinner").remove();
                            $(this).val("");
                        });
                }
            } else {
                if (this.files && this.files[0]) {
                    CustomerProfile.previewImage(this.files[0], "previewProfileImage");
                }
            }

            $(this).data("direct-upload", "false");
        });

        $("#changeProfileImageBtn").click(function () {
            $("#profileImageUpload").data("direct-upload", "true").click();
        });
    },

    loadBasicUserData: function() {
        $("#userName").text("Loading...");

        fetch(`${CONFIG.API.BASE_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load user data');
                }
                return response.json();
            })
            .then(data => {
                $("#userName").text(data.name);
                window.userData = data;
            })
            .catch(error => {
                console.error("Failed to load user data:", error);
                $("#userName").text("Customer");
            });
    },

    loadDetailedUserData: function() {
        $("#profileName, #infoName").text("Loading...");
        $("#profileEmail, #infoEmail").text("loading@example.com");
        $("#profileImage").attr("src");
        $("#profileMember").text("Member since: Loading...");
        $("#infoPhone").text("Loading...");
        $("#infoAddress").text("Loading...");
        $("#totalBookings").text("0");
        $("#totalReviews").text("0");

        API.getUserDetailedProfile()
            .then(data => {
                localStorage.setItem("userId", data.id);

                $("#profileName, #infoName").text(data.name || "User");
                $("#profileEmail, #infoEmail").text(data.email || "No email provided");

                if (data.profile_image) {
                    $("#profileImage").attr("src", data.profile_image);
                    $("#previewProfileImage").attr("src", data.profile_image);
                }

                const memberSince = new Date(data.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                $("#profileMember").text(`Member since: ${memberSince}`);

                $("#infoPhone").text(data.phone || "Not provided");
                $("#infoAddress").text(data.address || "Not provided");

                $("#totalBookings").text(data.bookings_count || "0");
                $("#totalReviews").text(data.reviews_count || "0");

                $("#editName").val(data.name);
                $("#editEmail").val(data.email);
                $("#editPhone").val(data.phone || "");
                $("#editAddress").val(data.address || "");

                if (data.profile_image) {
                    $("#previewProfileImage").attr("src", data.profile_image);
                }
            })
            .catch(error => {
                console.error("Failed to load detailed user data:", error);
                showNotification("Failed to load profile data", "error");
            });
    },

    openEditProfileModal: function() {
        const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
        editProfileModal.show();
    },

    previewImage: function(file, previewElementId) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $(`#${previewElementId}`).attr("src", e.target.result);
        };
        reader.readAsDataURL(file);
    },

    saveProfileChanges: function() {
        const profileData = {
            name: $("#editName").val(),
            email: $("#editEmail").val(),
            phone: $("#editPhone").val(),
            address: $("#editAddress").val()
        };

        $("#saveProfileBtn").prop("disabled", true).html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Saving...
        `);

        API.updateUserProfile(profileData)
            .then(response => {
                const profileImageInput = document.getElementById("profileImageUpload");
                if (profileImageInput.files && profileImageInput.files[0]) {
                    const formData = new FormData();
                    formData.append("image", profileImageInput.files[0]);

                    return API.updateProfileImage(formData);
                }
                return response;
            })
            .then(response => {
                bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();

                if (response.user && response.user.profile_image) {
                    $("#profileImage").attr("src", response.user.profile_image);
                }

                CustomerProfile.loadDetailedUserData();

                showNotification("Profile updated successfully", "success");
            })
            .catch(error => {
                console.error("Failed to update profile:", error);
                showNotification("Failed to update profile", "error");
            })
            .finally(() => {
                $("#saveProfileBtn").prop("disabled", false).text("Save Changes");
            });
    }
};