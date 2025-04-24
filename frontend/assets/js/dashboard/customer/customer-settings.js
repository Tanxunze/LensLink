// customer-settings.js
const CustomerSettings = {
    init: function() {
        this.initPasswordChangeFeature();
    },

    initPasswordChangeFeature: function() {
        // Listen for clicks on the change password link
        $("#changePasswordLink").on("click", function (e) {
            e.preventDefault();

            // If accessing settings first, make sure settings section is shown
            if (!$("#settingsSection").is(":visible")) {
                $(".nav-link").removeClass("active");
                $('[data-section="settings"]').addClass("active");
                $(".dashboard-section").addClass("d-none");
                $("#settingsSection").removeClass("d-none");
            }

            // Show the change password modal
            CustomerSettings.showPasswordModal();
        });

        // Password visibility toggle
        $(document).on("click", ".toggle-password", function () {
            CustomerSettings.togglePasswordVisibility($(this));
        });

        // Password strength meter
        $(document).on("input", "#newPassword", function () {
            CustomerSettings.updatePasswordStrength($(this).val());
        });

        // Password submit handler
        $("#submitPasswordBtn").on("click", function () {
            CustomerSettings.submitPasswordChange();
        });

        // Reset form when modal is closed
        $('#changePasswordModal').on('hidden.bs.modal', function () {
            CustomerSettings.resetPasswordForm();
        });

        // Handle direct access via URL hash
        this.handleDirectPasswordAccess();
    },

    showPasswordModal: function() {
        const changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
        changePasswordModal.show();
    },

    togglePasswordVisibility: function(toggleButton) {
        const targetId = toggleButton.data("target");
        const input = $(`#${targetId}`);
        const icon = toggleButton.find("i");

        if (input.attr("type") === "password") {
            input.attr("type", "text");
            icon.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            input.attr("type", "password");
            icon.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    },

    updatePasswordStrength: function(password) {
        let strength = 0;

        if (password.length >= 8) strength += 20;
        if (password.match(/[a-z]+/)) strength += 20;
        if (password.match(/[A-Z]+/)) strength += 20;
        if (password.match(/[0-9]+/)) strength += 20;
        if (password.match(/[^a-zA-Z0-9]+/)) strength += 20;

        const progressBar = $("#passwordStrength");
        progressBar.css("width", `${strength}%`);

        if (strength < 40) {
            progressBar.removeClass("bg-warning bg-success").addClass("bg-danger");
        } else if (strength < 80) {
            progressBar.removeClass("bg-danger bg-success").addClass("bg-warning");
        } else {
            progressBar.removeClass("bg-danger bg-warning").addClass("bg-success");
        }
    },

    submitPasswordChange: function() {
        // Get form values
        const currentPassword = $("#currentPassword").val();
        const newPassword = $("#newPassword").val();
        const confirmPassword = $("#confirmNewPassword").val();

        // Client-side validation
        if (!this.validatePasswordForm(currentPassword, newPassword, confirmPassword)) {
            return;
        }

        // Show loading state
        const submitButton = $("#submitPasswordBtn");
        this.setButtonLoading(submitButton, true);

        // Submit the password change
        this.sendPasswordChangeRequest(currentPassword, newPassword, confirmPassword)
            .then(this.handlePasswordChangeSuccess)
            .catch(this.handlePasswordChangeError)
            .finally(() => {
                this.setButtonLoading(submitButton, false);
            });
    },

    validatePasswordForm: function(currentPassword, newPassword, confirmPassword) {
        if (!currentPassword) {
            showNotification("Please enter your current password", "warning");
            return false;
        }

        if (!newPassword) {
            showNotification("Please enter a new password", "warning");
            return false;
        }

        if (newPassword.length < 8) {
            showNotification("New password must be at least 8 characters long", "warning");
            return false;
        }

        if (newPassword !== confirmPassword) {
            showNotification("New password and confirmation do not match", "warning");
            return false;
        }

        return true;
    },

    sendPasswordChangeRequest: function(currentPassword, newPassword, confirmPassword) {
        return fetch(`${CONFIG.API.BASE_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw { status: response.status, data: data };
                    });
                }
                return response.json();
            });
    },

    handlePasswordChangeSuccess: function(data) {
        CustomerSettings.resetPasswordForm();

        // Hide the modal
        bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();

        // Show success notification
        showNotification("Password changed successfully", "success");
    },

    handlePasswordChangeError: function(error) {
        let errorMessage = "Failed to change password";

        if (error.status === 422) {
            if (error.data && error.data.errors) {
                if (error.data.errors.current_password) {
                    errorMessage = "Current password is incorrect";
                } else if (error.data.errors.new_password) {
                    errorMessage = error.data.errors.new_password[0] || "Invalid new password format";
                }
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
        } else if (error.status === 401) {
            errorMessage = "Authentication failed, please log in again";
            setTimeout(() => {
                window.location.href = "../../pages/auth/login.html";
            }, 2000);
        }

        showNotification(errorMessage, "error");
    },

    resetPasswordForm: function() {
        $("#passwordChangeForm")[0].reset();
        $("#passwordStrength").css("width", "0%");
    },

    setButtonLoading: function(button, isLoading) {
        if (isLoading) {
            button.prop("disabled", true).html(`
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Updating...
            `);
        } else {
            button.prop("disabled", false).text("Change Password");
        }
    },

    handleDirectPasswordAccess: function() {
        if (window.location.hash === "#settings:password") {
            setTimeout(() => {
                $(".nav-link[data-section='settings']").click();
                setTimeout(() => {
                    $("#changePasswordLink").click();
                }, 300);
            }, 300);
        }
    }
};