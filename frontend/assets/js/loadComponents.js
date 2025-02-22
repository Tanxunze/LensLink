document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("/pages/dashboard/")) {
    // if dashboard pages, remove header and footer
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");
    if (header) header.remove();
    if (footer) footer.remove();
    return;
  }

  // not dashboard pages, load header and footer
  const headerResponse = await fetch(
    `${CONFIG.BASE_URL}components/header.html`
  );
  const headerHtml = await headerResponse.text();
  document.getElementById("header").innerHTML = headerHtml;

  document.getElementById("homeLink").href = `${CONFIG.BASE_URL}index.html`;
  document.getElementById(
    "photographersLink"
  ).href = `${CONFIG.BASE_URL}pages/photographers.html`;
  document.getElementById(
    "servicesLink"
  ).href = `${CONFIG.BASE_URL}pages/services.html`;

  const footerResponse = await fetch(
    `${CONFIG.BASE_URL}components/footer.html`
  );
  const footerHtml = await footerResponse.text();
  document.getElementById("footer").innerHTML = footerHtml;

  document.getElementById(
    "footerPhotographersLink"
  ).href = `${CONFIG.BASE_URL}pages/photographers.html`;
  document.getElementById(
    "footerServicesLink"
  ).href = `${CONFIG.BASE_URL}pages/services.html`;
  document.getElementById(
    "footerRegisterLink"
  ).href = `${CONFIG.BASE_URL}pages/auth/register.html`;

  updateAuthLinks();
});

function updateAuthLinks() {
  const authLinksElement = document.getElementById("authLinks");
  const isLoggedIn = false;
  const isPhotographer = false; //Todo

  if (isLoggedIn) {
    const dashboardUrl = isPhotographer
      ? `${CONFIG.BASE_URL}pages/dashboard/photographer.html`
      : `${CONFIG.BASE_URL}pages/dashboard/customer.html`;
    authLinksElement.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="${dashboardUrl}">Dashboard</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="logout()">Logout</a>
            </li>
        `;
  } else {
    authLinksElement.innerHTML = `
            <li class="nav-item">
                <a class="btn btn-outline-success me-2" href="${CONFIG.BASE_URL}pages/auth/login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="btn btn-primary" href="${CONFIG.BASE_URL}pages/auth/register.html">Register</a>
            </li>
        `;
  }
}
