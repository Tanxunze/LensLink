const CONFIG = {
    BASE_URL: (function () {
        if (window.location.pathname.includes("/pages/auth/")) {
            return "../../";
        } else if (window.location.pathname.includes("/pages/")) {
            return "../";
        } else {
            return "./";
        }
    })(),

    // Check if components (header/footer) are needed
    needsComponents: function () {
        return !window.location.pathname.includes("/pages/dashboard/");
    },

    // API configuration
    API: {
        BASE_URL: determineApiUrl()
    },

    // user info from localStorage
    getCurrentUser: function () {
        return {
            isLoggedIn: localStorage.getItem("token") !== null,
            token: localStorage.getItem("token"),
            role: localStorage.getItem("userRole"),
        };
    },

    // Site-wide settings
    SETTINGS: {
        defaultPageSize: 10,
        dateFormat: "MMMM D, YYYY",
        supportEmail: "support@lenslink.com",
    },
};

function determineApiUrl() {
    const currentDomain = window.location.hostname;
    console.log('Debug - Current hostname:', currentDomain);
    console.log('Debug - Full URL:', window.location.href);
    console.log('Debug - Is localhost match:', currentDomain === 'localhost');
    console.log('Debug - Is lenslink match:', currentDomain === 'lenslink.mionet.top');

    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
        console.log('dev env');
        return "http://localhost:8089/api";
    }
    else if (currentDomain === 'lenslink.mionet.top') {
        console.log('prod env');
        return "https://api-lenslink.mionet.top/api";
    }
    else {
        console.log('fallback env - domain is:', currentDomain);
        return "https://api-lenslink.mionet.top/api";
    }
}

// jQuery extension
(function ($) {
    $.lenslink = {
        // Format currency values
        formatCurrency: function (value) {
            return "€" + parseFloat(value).toFixed(2);
        },

        // Generate star rating HTML
        generateStarRating: function (rating) {
            let stars = "";
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating - fullStars >= 0.5;

            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    stars += '<i class="bi bi-star-fill text-warning"></i>';
                } else if (i === fullStars + 1 && hasHalfStar) {
                    stars += '<i class="bi bi-star-half text-warning"></i>';
                } else {
                    stars += '<i class="bi bi-star text-warning"></i>';
                }
            }

            return stars;
        },

        // Format dates using configured format
        formatDate: function (dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        },

        // Get appropriate badge class for status
        getStatusBadgeClass: function (status) {
            switch (status.toLowerCase()) {
                case "confirmed":
                    return "bg-success";
                case "pending":
                    return "bg-warning";
                case "cancelled":
                    return "bg-danger";
                case "completed":
                    return "bg-info";
                default:
                    return "bg-secondary";
            }
        },

        // Show notification toast
        showNotification: function (message, type = "info") {
            // Create toast element if it doesn't exist
            if ($("#notification-container").length === 0) {
                $("body").append(
                    '<div id="notification-container" style="position:fixed; top:20px; right:20px; z-index:9999;"></div>'
                );
            }

            // Create a unique ID 
            const toastId = "toast-" + Date.now();

            // Get appropriate color class
            let bgClass = "bg-info";
            if (type === "success") bgClass = "bg-success";
            if (type === "error") bgClass = "bg-danger";
            if (type === "warning") bgClass = "bg-warning";

            // Create toast HTML
            const toastHtml = `
                <div id="${toastId}" class="toast align-items-center ${bgClass} text-white" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">${message}</div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `;
            $("#notification-container").append(toastHtml);
            // Initialize and show 
            const toastElement = new bootstrap.Toast(
                document.getElementById(toastId),
                {
                    autohide: true,
                    delay: 5000,
                }
            );
            toastElement.show();
            $(`#${toastId}`).on("hidden.bs.toast", function () {
                $(this).remove();
            });
        },
    };
})(jQuery);
