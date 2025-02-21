document.addEventListener("DOMContentLoaded", async () => {
    const baseUrl = CONFIG.BASE_URL;
    const headerResponse = await fetch(`${baseUrl}components/header.html`);
    const headerHtml = await headerResponse.text();
    document.getElementById("header").innerHTML = headerHtml;

    const footerResponse = await fetch(`${baseUrl}components/footer.html`);
    const footerHtml = await footerResponse.text();
    document.getElementById("footer").innerHTML = footerHtml;
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
                <a class="nav-link" href="${CONFIG.BASE_URL}pages/auth/login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="${CONFIG.BASE_URL}pages/auth/register.html">Register</a>
            </li>
        `;
  }
}
