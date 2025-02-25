$(document).ready(function () {

  checkAuthentication();

  initTooltips();

  handleMobileSidebar();

  handleNavigation();

  $("#logoutLink").click(function (e) {
    e.preventDefault();
    logout();
  });

  initNotificationToast();
});


function checkAuthentication() {

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "../../pages/auth/login.html";
    return;
  }

  verifyToken(token).catch((error) => {
    console.error("Token verification failed:", error);
    showNotification("Your session has expired. Please login again.", "error");

    localStorage.removeItem("token");
    localStorage.removeItem("userRole");

    setTimeout(() => {
      window.location.href = "../../pages/auth/login.html";
    }, 2000);
  });
}

/**
 * Verify the validity of the token
 * @param {string} token - user authentication token
 * @returns {Promise} - Verification results
 */
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    fetch(`${CONFIG.API.BASE_URL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Token verification failed");
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

/**
 * Initialising Bootstrap Tools
 */
function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
}

/**
 * mobile device
 */
function handleMobileSidebar() {
  if (window.innerWidth < 768) {
    const toggleButton = document.createElement("button");
    toggleButton.className = "navbar-toggler d-md-none";
    toggleButton.innerHTML = '<span class="navbar-toggler-icon"></span>';
    toggleButton.setAttribute("type", "button");
    toggleButton.setAttribute("aria-label", "Toggle navigation");

    document.querySelector(".navbar-brand").after(toggleButton);

    toggleButton.addEventListener("click", function () {
      document.querySelector(".sidebar").classList.toggle("show");
    });
      
    document
      .querySelector(".main-content")
      .addEventListener("click", function () {
        document.querySelector(".sidebar").classList.remove("show");
      });
  }
}

/**
 * Handling navigation menu clicks
 */
function handleNavigation() {
  $(".nav-link").click(function (e) {
    e.preventDefault();
    const section = $(this).data("section");

    // update active link
    $(".nav-link").removeClass("active");
    $(this).addClass("active");

    $(".dashboard-section").addClass("d-none");
    $(`#${section}Section`).removeClass("d-none");

    if (window.innerWidth < 768) {
      document.querySelector(".sidebar").classList.remove("show");
    }

    $(document).trigger(`section:${section}`);
  });

  // settings menu
  $(".settings-menu .list-group-item").click(function (e) {
    e.preventDefault();
    const settingsPanel = $(this).data("settings");

    $(".settings-menu .list-group-item").removeClass("active");
    $(this).addClass("active");

    $(".settings-panel").addClass("d-none");
    $(`#${settingsPanel}Settings`).removeClass("d-none");
  });
}

/**
 * logout
 */
function logout() {
  showNotification("Logging you out...", "info");

  fetch(`${CONFIG.API.BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "../../index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "../../index.html";
    });
}

/**
 * Initialise notification toast
 */
function initNotificationToast() {
  window.notificationToast = new bootstrap.Toast(
    document.getElementById("notificationToast")
  );
}

/**
 * Show notification messages
 * @param {string} message - Notification message content
 * @param {string} type - Type of notification (success, error, info, warning)
 */
function showNotification(message, type = "info") {
  // 设置标题和时间
  $("#toastTitle").text(type.charAt(0).toUpperCase() + type.slice(1));
  $("#toastTime").text(new Date().toLocaleTimeString());
  $("#toastMessage").text(message);

  const toast = $("#notificationToast");
  toast.removeClass("bg-success bg-danger bg-info bg-warning text-white");

  switch (type) {
    case "success":
      toast.addClass("bg-success text-white");
      break;
    case "error":
      toast.addClass("bg-danger text-white");
      break;
    case "warning":
      toast.addClass("bg-warning");
      break;
    default: // info
      toast.addClass("bg-info text-white");
  }

  // display toast
  window.notificationToast.show();
}

/*tool functions*/
/**
 * Formatting Date
 * @param {string} dateString - date
 * @returns {string} formatted date
 */
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Get status label style class
 * @param {string} status - value of status
 * @returns {string} Bootstrap label style class
 */
function getStatusBadgeClass(status) {
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
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - input string
 * @returns {string} - output string
 */
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Generate star rating 
 * @param {number} rating - value of rating
 * @returns {string} - HTML content of star rating
 */
function generateStarRating(rating) {
  let starsHtml = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  // full star
  for (let i = 1; i <= fullStars; i++) {
    starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
  }

  // half of star
  if (hasHalfStar) {
    starsHtml += '<i class="bi bi-star-half text-warning"></i>';
  }

  // empty star
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 1; i <= emptyStars; i++) {
    starsHtml += '<i class="bi bi-star text-warning"></i>';
  }

  return starsHtml;
}

/* !!! This function may need to be updated later - Xunze !!!*/
/**
 * Upload image
 * @param {File} file - file object
 * @returns {Promise} - response data
 */
function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("image", file);
    fetch(`${CONFIG.API.BASE_URL}/uploads/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Image upload failed");
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

/* !!! also need to be updated later - Xunze !!!*/
/**
 * Preview Images
 * @param {File} file - img file
 * @param {string} previewElementId - preview element id
 */
function previewImage(file, previewElementId) {
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById(previewElementId).src = e.target.result;
  };
  reader.readAsDataURL(file);
}
