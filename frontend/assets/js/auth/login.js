$(document).ready(function () {
    // Check if user is already logged in
    if (localStorage.getItem("token")) {
        const userRole = localStorage.getItem("userRole");
        redirectToUserDashboard(userRole);
        return;
    }

    // Handle form submission
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        handleLogin();
    });
});

function redirectToUserDashboard(role) {
    let redirectPath;

    switch (role) {
        case "admin":
            redirectPath = "../dashboard/admin.html";
            break;
        case "photographer":
            redirectPath = "../dashboard/photographer.html";
            break;
        default: // customer or fallback
            redirectPath = "../dashboard/customer.html";
            break;
    }

    window.location.href = redirectPath;
}

function handleLogin() {
    // Hide any previous error messages
    $("#loginError").addClass("d-none");
    $("#banWarning").addClass("d-none");

    // Show loading state
    const submitButton = $("#loginForm button[type='submit']");
    const originalText = submitButton.text();
    submitButton.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...');
    submitButton.prop('disabled', true);

    // Get form values
    const credentials = {
        email: $("#email").val(),
        password: $("#password").val(),
        remember: $("#rememberMe").is(":checked")
    };

    // Call login API
    API.login(credentials)
        .then(function (response) {
            if (response.token) {
                // Store token and user role
                localStorage.setItem("token", response.token);
                localStorage.setItem("userRole", response.user.role);

                if (response.remember) {
                    localStorage.setItem("remember_login", "true");
                    localStorage.setItem("token_expires_at", response.expires_at);
                }

                // Redirect based on user role
                redirectToUserDashboard(response.user.role);
            }
        })
        .catch(function (error) {
            let errorMessage = 'Login failed. Please check your credentials.';

            // Check if response contains ban information
            if (error.responseJSON && error.responseJSON.banned) {
                showBanWarning(error.responseJSON.ban_details);
                return;
            } else if (error.responseJSON && error.responseJSON.errors && error.responseJSON.errors.email) {
                errorMessage = error.responseJSON.errors.email[0];
            } else if (error.responseJSON && error.responseJSON.message) {
                errorMessage = error.responseJSON.message;
            }

            $("#loginError")
                .text(errorMessage)
                .removeClass("d-none");

            // debug
            console.error("Login error:", error);
        })
        .finally(function () {
            submitButton.html(originalText);
            submitButton.prop('disabled', false);
        });
}

function showBanWarning(banDetails) {
    let banMessage = "Your account has been suspended.";

    if (banDetails) {
        if (banDetails.reason) {
            banMessage += " Reason: " + banDetails.reason;
        }

        if (banDetails.expires_at && banDetails.expires_at !== "permanent") {
            const expiryDate = new Date(banDetails.expires_at);
            banMessage += " Your ban will expire on " + expiryDate.toLocaleDateString();
        } else if (banDetails.duration === -1 || banDetails.expires_at === "permanent") {
            banMessage += " This is a permanent ban.";
        }
    }

    banMessage += " Please contact support for assistance.";

    $("#banWarning")
        .text(banMessage)
        .removeClass("d-none");
}
function initGoogleLogin() {
    $("#googleLogin").click(function () {
        const button = $(this);
        const originalText = button.html();
        button.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Connecting to Google...');
        button.prop('disabled', true);
        window.location.href = API.getGoogleAuthURL();
    });
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        $("#loginError")
            .text(decodeURIComponent(urlParams.get('error')))
            .removeClass("d-none");
    }
    if (urlParams.has('token') && urlParams.has('user')) {
        try {
            const token = urlParams.get('token');
            const user = JSON.parse(decodeURIComponent(urlParams.get('user')));

            // Check if user is banned from Google login
            if (urlParams.has('banned') && urlParams.get('banned') === 'true') {
                const banDetails = urlParams.has('ban_details')
                    ? JSON.parse(decodeURIComponent(urlParams.get('ban_details')))
                    : null;
                showBanWarning(banDetails);
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("userRole", user.role);
            if (urlParams.has('remember') && urlParams.get('remember') === 'true') {
                localStorage.setItem("remember_login", "true");
                if (urlParams.has('expires_at')) {
                    localStorage.setItem("token_expires_at", urlParams.get('expires_at'));
                }
            }

            redirectToUserDashboard(user.role);
        } catch (error) {
            console.error("Error processing login callback:", error);
            $("#loginError")
                .text("Please try again.")
                .removeClass("d-none");
        }
    }
}
initGoogleLogin();