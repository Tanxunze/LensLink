$(document).ready(function () {
    if (window.location.pathname.includes("/pages/dashboard/")) {
        // if dashboard page, remove header and footer
        $("#header, #footer").remove();
        return;
    }

    // if not dashboard page, load header and footer
    $.get(`${CONFIG.BASE_URL}components/header.html`, function (headerHtml) {
        $("#header").html(headerHtml);

        $("#homeLink").attr("href", `${CONFIG.BASE_URL}index.html`);
        $("#photographersLink").attr(
            "href",
            `${CONFIG.BASE_URL}pages/photographers.html`
        );
        $("#servicesLink").attr("href", `${CONFIG.BASE_URL}pages/services.html`);

        updateAuthLinks();
    });

    $.get(`${CONFIG.BASE_URL}components/footer.html`, function (footerHtml) {
        $("#footer").html(footerHtml);

        $("#footerPhotographersLink").attr(
            "href",
            `${CONFIG.BASE_URL}pages/photographers.html`
        );
        $("#footerServicesLink").attr(
            "href",
            `${CONFIG.BASE_URL}pages/services.html`
        );
        $("#footerRegisterLink").attr(
            "href",
            `${CONFIG.BASE_URL}pages/auth/register.html`
        );
    });
});

function updateAuthLinks() {
    // check if user is logged in and get user role
    const isLoggedIn = localStorage.getItem("token") !== null;
    const userRole = localStorage.getItem("userRole");
    const isPhotographer = userRole === "photographer";

    if (isLoggedIn) {
        const dashboardUrl = isPhotographer
            ? `${CONFIG.BASE_URL}pages/dashboard/photographer.html`
            : `${CONFIG.BASE_URL}pages/dashboard/customer.html`;

        $("#authLinks").html(`
        <li class="nav-item">
        <a class="nav-link" href="${dashboardUrl}">Dashboard</a>
        </li>
        <li class="nav-item">
        <a class="nav-link" href="#" id="logoutBtn">Logout</a>
        </li>
    `);

        // logout button click event
        $("#logoutBtn").click(function (e) {
            e.preventDefault();
            logout();
        });
    } else {
        $("#authLinks").html(`
        <li class="nav-item">
        <a class="btn btn-outline-success me-2" href="${CONFIG.BASE_URL}pages/auth/login.html">Login</a>
        </li>
        <li class="nav-item">
        <a class="btn btn-primary" href="${CONFIG.BASE_URL}pages/auth/register.html">Register</a>
        </li>
    `);
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = `${CONFIG.BASE_URL}index.html`;
}
