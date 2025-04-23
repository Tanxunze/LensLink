const PhotographerBookings = {
    init: function() {
        
    },

    showBookingsSection: function(status = "all") {
        $(".nav-link").removeClass("active");
        $('[data-section="bookings"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#bookingsSection").removeClass("d-none");
        $(".dropdown-item[data-filter]").removeClass("active");
        $(".dropdown-item[data-filter='" + status + "']").addClass("active");

        this.filterBookings(status);
        window.location.hash = "bookings:" + status;
    },

    filterBookings: function(status) {
        this.loadBookings(status);
    },

    loadBookings: function(status = "all", page = 1) {
        console.log("Status in loadBookings: ", status);
        $("#bookingsTable").html(`
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading bookings...</p>
                </td>
            </tr>
        `);

        $("#bookingsPagination").empty();

        const requestData = {
            filter: {
                status: status
            }
        };

        fetch(`${CONFIG.API.BASE_URL}/photographer/bookings-details`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load bookings. Please try again later.');
                }
                return response.json();
            })
            .then(data => {
                if (!data || data.length === 0) {
                    $("#bookingsTable").html(`
                        <tr>
                            <td colspan="8" class="text-center">
                                No bookings found.
                            </td>
                        </tr>
                    `);

                    $("#bookingsPagination").empty();
                    return;
                }

                const bookingsHtml = data.bookings.map(booking => `
                    <tr>
                        <td>${booking.customer_name}</td>
                        <td>${booking.service_name}</td>
                        <td>${formatDate(booking.booking_date)}</td>
                        <td>${booking.booking_time}</td>
                        <td>${booking.location || 'N/A'}</td>
                        <td>
                            <span class="badge ${getStatusBadgeClass(booking.status)}">
                                ${capitalizeFirstLetter(booking.status)}
                            </span>
                        </td>
                        <td>€${booking.total_amount}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary viewBookingBtn" data-id="${booking.id}" title="View Details">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-outline-success messageClientBtn" data-id="${booking.customer_id}" title="Message Client">
                                    <i class="bi bi-chat"></i>
                                </button>
                                ${booking.status === 'pending' ? `
                                    <button class="btn btn-outline-info acceptBookingBtn" data-id="${booking.id}" title="Accept Booking">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                    <button class="btn btn-outline-danger rejectBookingBtn" data-id="${booking.id}" title="Reject Booking">
                                        <i class="bi bi-x-lg"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('');

                $("#bookingsTable").html(bookingsHtml);

                if (data.total_pages > 1) {
                    let paginationHtml = ``;

                    paginationHtml += `
                        <li class="page-item ${page === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${page - 1}" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    `;

                    for (let i = 1; i <= data.total_pages; i++) {
                        paginationHtml += `
                            <li class="page-item ${i === page ? 'active' : ''}">
                                <a class="page-link" href="#" data-page="${i}">${i}</a>
                            </li>
                        `;
                    }

                    paginationHtml += `
                        <li class="page-item ${page === data.total_pages ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${page + 1}" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    `;

                    $("#bookingsPagination").html(paginationHtml);

                    $(".viewBookingBtn").click(function () {
                        const bookingId = $(this).data("id");
                        PhotographerBookings.openBookingDetailsModal(bookingId);
                    });

                    $(".acceptBookingBtn").click(function () {
                        const bookingId = $(this).data("id");
                        PhotographerBookings.updateBookingStatus(bookingId, "confirmed");
                    });

                    $(".rejectBookingBtn").click(function () {
                        const bookingId = $(this).data("id");
                        PhotographerBookings.updateBookingStatus(bookingId, "cancelled");
                    });

                    $(".messageClientBtn").click(function () {
                        const clientId = $(this).data("id");
                        PhotographerMessages.messageClient(clientId);
                    });
                }
            })
            .catch(error => {
                console.error("Failed to load bookings: ", error);
                $("#bookingsTable").html(`
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            Failed to load bookings. Please try again.
                        </td>
                    </tr>
                `)
            });
    },

    openBookingDetailsModal: function(bookingId) {
        if (!document.getElementById('bookingDetailModal')) {
            const modalHtml = `
                <div class="modal fade" id="bookingDetailModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Booking Details</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="text-center">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p>Loading Booking Details...</p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary edit-booking-btn">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            setTimeout(() => {
                this.loadBookingDetails(bookingId);
            }, 100);
        } else {
            this.loadBookingDetails(bookingId);
        }

        const bookingModal = new bootstrap.Modal(document.getElementById('bookingDetailModal'));
        bookingModal.show();
    },

    loadBookingDetails: function(bookingId) {
        const modalBody = document.querySelector('#bookingDetailModal .modal-body');

        if (!modalBody) {
            console.error('Booking detail modal body not found');
            return;
        }

        modalBody.innerHTML = `
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading Booking Details...</p>
            </div>
        `;

        console.log("BookingId: ", bookingId);

        fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load booking details');
                }
                return response.json();
            })
            .then(booking => {
                modalBody.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Customer Information</h6>
                            <p><strong>Name:</strong> ${booking.customer_name}</p>
                            <p><strong>E-mail:</strong> ${booking.customer_email || 'Not Provided'}</p>
                            <p><strong>Telephone:</strong> ${booking.customer_phone || 'Not Provided'}</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Booking Details</h6>
                            <p><strong>Service:</strong> ${booking.service_name}</p>
                            <p><strong>Date:</strong> ${formatDate(booking.booking_date)}</p>
                            <p><strong>Time:</strong> ${booking.booking_time}</p>
                            <p><strong>Location:</strong> ${booking.location || 'Not Specified'}</p>
                            <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(booking.status)}">${capitalizeFirstLetter(booking.status)}</span></p>
                            <p><strong>Price:</strong> €${booking.total_amount}</p>
                        </div>
                    </div>
                    ${booking.notes ? `
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Notes</h6>
                            <p>${booking.notes}</p>
                        </div>
                    </div>` : ''}
                `;

                const editBtn = document.querySelector('#bookingDetailModal .edit-booking-btn');
                if (editBtn) {
                    editBtn.onclick = function () {
                        document.body.focus();
                        bootstrap.Modal.getInstance(document.getElementById('bookingDetailModal')).hide();
                        PhotographerBookings.editBooking(bookingId);
                    }
                } else {
                    console.error("Edit button not found");
                }
            })
            .catch(error => {
                console.error("Failed to load booking details: ", error);
                document.querySelector('#bookingDetailModal .modal-body').innerHTML = `
                    <div class="alert alert-danger">
                        Failed to load booking details. Please try again.
                    </div>
                `;
            });
    },

    editBooking: function(bookingId) {
        if (!document.getElementById('editBookingModal')) {
            const modalHtml = `
                <div class="modal fade" id="editBookingModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit Booking</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="text-center">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p>Loading Booking Details</p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveBookingChangesBtn">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            setTimeout(() => {
                this.editBookingDetails(bookingId);
            }, 100)
        } else {
            this.editBookingDetails(bookingId);
        }

        const editModal = new bootstrap.Modal(document.getElementById('editBookingModal'));
        editModal.show();
    },

    editBookingDetails: function(bookingId) {
        const modalBody = document.querySelector('#editBookingModal .modal-body');

        if (!modalBody) {
            console.error('Edit detail modal body not found');
            return;
        }

        fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load booking data');
                }
                return response.json();
            })
            .then(booking => {
                const bookingDate = booking.booking_date ? new Date(booking.booking_date) : new Date();
                const formattedDate = bookingDate.toISOString().split('T')[0];

                let bookingTime = '';
                if (booking.booking_time) {
                    if (booking.booking_time.includes('T')) {
                        bookingTime = booking.booking_time.split('T')[1].substring(0, 5);
                    } else if (booking.booking_time.includes(':')) {
                        bookingTime = booking.booking_time.substring(0, 5);
                    }
                }
                modalBody.innerHTML = `
                    <form id="editBookingForm">
                        <input type="hidden" id="editBookingId" value="${booking.id}">
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="editBookingDate" class="form-label">Date</label>
                                <input type="date" class="form-control" id="editBookingDate" value="${formattedDate}" required>
                            </div>
                            <div class="col-md-6">
                                <label for="editBookingTime" class="form-label">Time</label>
                                <input type="time" class="form-control" id="editBookingTime" value="${bookingTime}" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="editBookingLocation" class="form-label">Location</label>
                            <input type="text" class="form-control" id="editBookingLocation" value="${booking.location || ''}">
                        </div>
                        
                        <div class="mb-3">
                            <label for="editBookingStatus" class="form-label">Status</label>
                            <select class="form-select" id="editBookingStatus" required>
                                <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="editBookingNotes" class="form-label">Notes</label>
                            <textarea class="form-control" id="editBookingNotes" rows="3">${booking.notes || ''}</textarea>
                        </div>
                    </form>
                `;

                document.getElementById('saveBookingChangesBtn').onclick = () => this.saveBookingChanges();
            })
            .catch(error => {
                console.error("Failed to load booking data: ", error);
                document.querySelector('#editBookingModal .modal-body').innerHTML = `
                    <div class="alert alert-danger">
                        Failed to load booking data. Please try again.
                    </div>
                `;
            })
    },

    saveBookingChanges: function() {
        const bookingId = document.getElementById('editBookingId').value;
        const bookingDate = document.getElementById('editBookingDate').value;
        const bookingTime = document.getElementById('editBookingTime').value;
        const bookingLocation = document.getElementById('editBookingLocation').value;
        const bookingStatus = document.getElementById('editBookingStatus').value;
        const bookingNotes = document.getElementById('editBookingNotes').value;

        if (!bookingDate || !bookingTime || !bookingStatus) {
            showNotification("Please fill in all required fields", "warning");
            return;
        }

        const saveBtn = document.getElementById('saveBookingChangesBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...`;

        fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                booking_date: bookingDate,
                booking_time: bookingTime,
                location: bookingLocation,
                status: bookingStatus,
                notes: bookingNotes
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save booking changes');
                }
                return response.json();
            })
            .then(data => {
                bootstrap.Modal.getInstance(document.getElementById('editBookingModal')).hide();
                showNotification("Booking changes saved successfully", "success");
                this.loadBookings();
            })
            .catch(error => {
                console.error("Failed to load booking changes: ", error);
                showNotification("Error while saving booking changes");
            })
            .finally(() => {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Changes";
            })
    },

    updateBookingStatus: function(bookingId, status) {
        if (!confirm(`Are you sure you want to update this booking status to ${status === 'confirmed' ? "Confirmed" : "Cancelled"}?`)) {
            return;
        }

        fetch(`${CONFIG.API.BASE_URL}/photographer/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update booking status');
                }
                return response.json();
            })
            .then(data => {
                showNotification("Booking updated successfully", "success");
                this.loadBookings();
            })
            .catch(error => {
                console.error("Failed to update booking status: ", error);
                showNotification("Error while saving booking changes. Please try again.", "danger");
            })
    },

    initializeBookingsCalendar: function() {
        console.log("Calendar initialization placeholder");
    }
};