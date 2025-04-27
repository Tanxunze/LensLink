let customerId = null;
let customerData = null;
let currentUser = null;

$(document).ready(function () {
    // Extract ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    customerId = urlParams.get('id');

    if (!customerId) {
        window.location.href = '../index.html';
        return;
    }

    // Load current user first if logged in
    if (localStorage.getItem("token")) {
        API.getCurrentUser()
            .then(response => {
                currentUser = response;
                loadCustomerDetails();
            })
            .catch(error => {
                console.error('Error fetching current user:', error);
                loadCustomerDetails();
            });
    } else {
        loadCustomerDetails();
    }

    // Event handlers
    $("#reportBtn").on("click", openReportModal);
    $("#submitReportBtn").on("click", submitReport);
    $("#contactBtn").on("click", openContactModal);
    $("#sendRequestBtn").on("click", sendContactRequest);
});

function loadCustomerDetails() {
    return API.getCustomerProfile(customerId)
        .then(response => {
            customerData = response.data;
            displayCustomerInfo(response.data);
        })
        .catch(error => {
            console.error('Error fetching customer details:', error);
            showErrorMessage('Failed to load customer details. Please try again later.');
        });
}

function displayCustomerInfo(customer) {
    document.title = `${customer.name} - LensLink`;

    $("#customerName").text(customer.name);
    $("#customerImage").attr('src', customer.profile_image || '../assets/images/default-avatar.jpg');
    $("#customerEmail").text(customer.email || 'Not provided');
    $("#memberSince").text(`Member since ${formatDate(customer.created_at)}`);
    $("#customerBio").text(customer.bio || 'No bio available');
}

function openReportModal() {
    // Check if user is logged in
    if (!localStorage.getItem("token")) {
        alert("Please log in to report a user");
        window.location.href = "../pages/auth/login.html";
        return;
    }

    // Check if trying to report yourself
    if (currentUser && currentUser.id.toString() === customerId.toString()) {
        $.lenslink.showNotification("You cannot report yourself.", "warning");
        return;
    }

    $("#reportForm")[0].reset();
    const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
    reportModal.show();
}

function submitReport() {
    if (!$("#reportForm")[0].checkValidity()) {
        $("#reportForm")[0].reportValidity();
        return;
    }

    const reason = $("#reportReason").val().trim();

    if (reason.length < 10) {
        $.lenslink.showNotification("Please provide a more detailed reason for your report", "warning");
        return;
    }

    const reportData = {
        user_id: customerData.id,  // Make sure we have the ID from customerData
        reason: reason
    };

    $("#submitReportBtn").prop("disabled", true)
        .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...');

    API.createReport(reportData)
        .then(response => {
            bootstrap.Modal.getInstance(document.getElementById('reportModal')).hide();
            $.lenslink.showNotification("Report submitted successfully. Our team will review it shortly.", "success");
        })
        .catch(error => {
            console.error("Error submitting report:", error);
            let errorMessage = "Failed to submit report. Please try again.";

            if (error.response && error.response.message) {
                errorMessage = error.response.message;
            }

            $.lenslink.showNotification(errorMessage, "error");
        })
        .finally(() => {
            $("#submitReportBtn").prop("disabled", false).text("Submit Report");
        });
}

function openContactModal() {
    // Check if user is logged in
    if (!localStorage.getItem("token")) {
        alert("Please log in to contact this user");
        window.location.href = "../pages/auth/login.html";
        return;
    }

    // Check if trying to contact yourself
    if (currentUser && currentUser.id.toString() === customerId.toString()) {
        $.lenslink.showNotification("You cannot contact yourself.", "warning");
        return;
    }

    $("#requestRecipientName").text(customerData.name);
    $("#contactRequestForm")[0].reset();

    const modal = new bootstrap.Modal(document.getElementById('contactRequestModal'));
    modal.show();
}

function sendContactRequest() {
    const requestData = {
        recipient_id: customerId,
        message: $("#requestMessage").val() || ""
    };

    $("#sendRequestBtn").prop("disabled", true)
        .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');

    API.sendContactRequest(requestData)
        .then(data => {
            bootstrap.Modal.getInstance(document.getElementById('contactRequestModal')).hide();
            $.lenslink.showNotification("Contact request sent successfully!", "success");
        })
        .catch(error => {
            console.error("Error sending contact request:", error);
            $.lenslink.showNotification("Failed to send contact request. Please try again.", "error");
        })
        .finally(() => {
            $("#sendRequestBtn").prop("disabled", false).text("Send Request");
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showErrorMessage(message) {
    $("main").prepend(`
        <div class="container mt-4">
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    `);
}