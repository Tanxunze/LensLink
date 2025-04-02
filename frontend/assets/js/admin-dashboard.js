$(document).ready(function () {
    initHashNavigation();
    checkAdminAuth();
    initThemeToggle();
    initEventListeners();
    loadDashboardStats();
    loadRecentActivities();

    $('.nav-link[href="#users"]').on('shown.bs.tab', function () {
        loadUsers(1);
    });

    $('#search-user-btn').click(function () {
        const searchTerm = $('#user-search').val();
        loadUsers(1, searchTerm);
    });

    $('#user-search').keypress(function (e) {
        if (e.which == 13) {
            $('#search-user-btn').click();
        }
    });
    $('.nav-link[href="#comments"]').on('shown.bs.tab', function () {
        loadComments(1);
    });

    $('#search-comment-btn').click(function () {
        const searchTerm = $('#comment-search').val();
        loadComments(1, searchTerm);
    });

    $('#comment-search').keypress(function (e) {
        if (e.which == 13) {
            $('#search-comment-btn').click();
        }
    });

    $('.nav-link[href="#messages"]').on('shown.bs.tab', function () {
        loadMessages(1);
    });

    $('#search-message-btn').click(function () {
        const searchTerm = $('#message-search').val();
        loadMessages(1, searchTerm);
    });

    $('#message-search').keypress(function (e) {
        if (e.which == 13) {
            $('#search-message-btn').click();
        }
    });

    $('.nav-link[href="#ban-list"]').on('shown.bs.tab', function () {
        loadBanList(1);
    });

    $('#search-ban-btn').click(function () {
        const searchTerm = $('#ban-search').val();
        loadBanList(1, searchTerm);
    });

    $('#ban-search').keypress(function (e) {
        if (e.which == 13) {
            $('#search-ban-btn').click();
        }
    });

    $('.nav-link[href="#logs"]').on('shown.bs.tab', function () {
        loadLogs(1);
    });

    $('#refresh-logs').click(function () {
        loadLogs(1);
    });

    $('#clear-logs').click(function () {
        clearLogs();
    });
});

function initHashNavigation() {
    handleHashChange();
    $(window).on('hashchange', handleHashChange);
    $('.nav-link[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        const hash = $(e.target).attr('href');

        if (hash && hash !== window.location.hash) {
            window.history.replaceState(null, null, hash);
        }
    });

    $('.card-footer a[data-bs-toggle="tab"]').on('click', function (e) {
        const hash = $(this).attr('href');
        if (hash.startsWith('#')) {
            e.preventDefault();

            const tabEl = document.querySelector(`.nav-link[href="${hash}"]`);
            if (tabEl) {
                const tab = new bootstrap.Tab(tabEl);
                tab.show();
                window.scrollTo(0, 0);
            }
        }
    });
}

function handleHashChange() {
    let hash = window.location.hash;

    if (!hash || !document.querySelector(`.nav-link[href="${hash}"]`)) {
        hash = '#dashboard';
        window.history.replaceState(null, null, hash);
    }

    const tabEl = document.querySelector(`.nav-link[href="${hash}"]`);
    if (tabEl) {
        const tab = new bootstrap.Tab(tabEl);
        tab.show();
        loadTabContent(hash);
    }
}

function loadTabContent(tabId) {
    if (tabId.startsWith('#')) {
        tabId = tabId.substring(1);
    }

    switch (tabId) {
        case 'dashboard':
            loadDashboardStats();
            loadRecentActivities();
            break;
        case 'users':
            loadUsers(1);
            break;
        case 'comments':
            loadComments(1);
            break;
        case 'messages':
            loadMessages(1);
            break;
        case 'ban-list':
            loadBanList(1);
            break;
        case 'logs':
            loadLogs(1);
            break;
    }
}

function checkAdminAuth() {
    showLoading();

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/auth/check`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            hideLoading();
            if (response.success) {
                $('#adminName').text(response.data.name);
            } else {
                window.location.href = '../auth/login.html';
            }
        },
        error: function () {
            hideLoading();
            window.location.href = '../auth/login.html';
        }
    });
}

function initThemeToggle() {
    const currentTheme = localStorage.getItem('admin-theme') || 'light';

    if (currentTheme === 'dark') {
        $('body').addClass('dark-mode');
        $('#theme-toggle i').removeClass('bi-moon-stars').addClass('bi-sun');
    }

    $('#theme-toggle').click(function () {
        $('body').toggleClass('dark-mode');

        if ($('body').hasClass('dark-mode')) {
            localStorage.setItem('admin-theme', 'dark');
            $('#theme-toggle i').removeClass('bi-moon-stars').addClass('bi-sun');
        } else {
            localStorage.setItem('admin-theme', 'light');
            $('#theme-toggle i').removeClass('bi-sun').addClass('bi-moon-stars');
        }
    });
}

function initEventListeners() {
    $('#logout-btn').click(function (e) {
        e.preventDefault();
        logout();
    });

    $('#refresh-dashboard').click(function () {
        loadDashboardStats();
        loadRecentActivities();
    });

    $('.nav-link').on('shown.bs.tab', function (e) {
        const target = $(e.target).attr('href');
        if (target === '#dashboard') {
            loadDashboardStats();
            loadRecentActivities();
        }
    });
}

function loadDashboardStats() {
    showCardLoading(['#totalUsers', '#totalPhotographers', '#reportedComments', '#bannedUsers']);

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/stats`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                $('#totalUsers').text(response.data.totalUsers || 0);
                $('#totalPhotographers').text(response.data.totalPhotographers || 0);
                $('#reportedComments').text(response.data.reportedComments || 0);
                $('#bannedUsers').text(response.data.bannedUsers || 0);
            } else {
                showToast('Error', 'Failed to load statistics', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        },
        complete: function () {
            hideCardLoading(['#totalUsers', '#totalPhotographers', '#reportedComments', '#bannedUsers']);
        }
    });
}

function loadRecentActivities() {
    $('#recent-activities').html('<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/activities`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                let html = '';

                if (response.data.length === 0) {
                    html = '<tr><td colspan="5" class="text-center">No recent activities found</td></tr>';
                } else {
                    response.data.forEach(activity => {
                        html += `
                            <tr>
                                <td>${activity.id}</td>
                                <td>${activity.user}</td>
                                <td>${activity.action}</td>
                                <td>${formatDateTime(activity.timestamp)}</td>
                                <td>
                                    <span class="badge bg-${getStatusBadgeClass(activity.status)}">
                                        ${activity.status}
                                    </span>
                                </td>
                            </tr>
                        `;
                    });
                }

                $('#recent-activities').html(html);
            } else {
                showToast('Error', 'Failed to load recent activities', 'error');
                $('#recent-activities').html('<tr><td colspan="5" class="text-center">Failed to load activities</td></tr>');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
            $('#recent-activities').html('<tr><td colspan="5" class="text-center">Failed to load activities</td></tr>');
        }
    });
}

function logout() {
    $.ajax({
        url: `${CONFIG.API.BASE_URL}/auth/logout`,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function () {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '../auth/login.html';
        },
        error: function () {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '../auth/login.html';
        }
    });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function getStatusBadgeClass(status) {
    switch (String(status).toLowerCase()) {
        case 'completed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'failed':
            return 'danger';
        case 'in progress':
            return 'info';
        default:
            return 'secondary';
    }
}

function showLoading() {
    if ($('.spinner-overlay').length === 0) {
        $('body').append(`
            <div class="spinner-overlay">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);
    }
}

function hideLoading() {
    $('.spinner-overlay').remove();
}

function showCardLoading(selectors) {
    selectors.forEach(selector => {
        const element = $(selector);
        element.html('<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>');
    });
}

function hideCardLoading(selectors) {
    // Not Empty!!!
}

function showToast(title, message, type = 'info') {
    let bgClass = 'bg-info';
    switch (type) {
        case 'success':
            bgClass = 'bg-success';
            break;
        case 'error':
            bgClass = 'bg-danger';
            break;
        case 'warning':
            bgClass = 'bg-warning';
            break;
    }

    $('#toast-title').text(title);
    $('#toast-message').text(message);
    $('#toast-time').text(new Date().toLocaleTimeString());
    $('#alertToast').removeClass('bg-success bg-danger bg-warning bg-info').addClass(bgClass);

    const toast = new bootstrap.Toast(document.getElementById('alertToast'));
    toast.show();
}

function handleAjaxError(xhr) {
    console.error('AJAX Error:', xhr);

    let errorMessage = 'An error occurred. Please try again.';

    if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
    }

    if (xhr.status === 401 || xhr.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '../auth/login.html';
        return;
    }

    showToast('Error', errorMessage, 'error');
}

function loadUsers(page = 1, search = '') {
    $('#users-table').html('<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/users?page=${page}&search=${search}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                renderUsersTable(response.data);
                renderPagination('users-pagination', page, response.meta.lastPage, search, loadUsers);
            } else {
                showToast('Error', 'Failed to load users', 'error');
                $('#users-table').html('<tr><td colspan="7" class="text-center">Failed to load users</td></tr>');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
            $('#users-table').html('<tr><td colspan="7" class="text-center">Failed to load users</td></tr>');
        }
    });
}

function renderUsersTable(users) {
    let html = '';

    if (users.length === 0) {
        html = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
    } else {
        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-${getRoleBadgeClass(user.role)}">${user.role}</span></td>
                    <td>${formatDate(user.created_at)}</td>
                    <td>
                        <span class="badge bg-${user.banned ? 'danger' : 'success'}">
                            ${user.banned ? 'Banned' : 'Active'}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-info view-user-btn" data-id="${user.id}" data-type="user" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${user.role !== 'admin' ?
                    (user.banned ?
                        `<button class="btn btn-sm btn-success unban-user-btn" data-id="${user.id}" title="Unban User">
                                    <i class="bi bi-unlock"></i>
                                </button>` :
                        `<button class="btn btn-sm btn-warning ban-user-btn" data-id="${user.id}" title="Ban User">
                                    <i class="bi bi-shield-x"></i>
                                </button>`
                    ) : ''
                }
                    </td>
                </tr>
            `;
        });
    }

    $('#users-table').html(html);

    $('.ban-user-btn').click(function () {
        const userId = $(this).data('id');
        openBanUserModal(userId);
    });

    $('.unban-user-btn').click(function () {
        const userId = $(this).data('id');
        confirmUnbanUser(userId);
    });

    $('.view-user-btn').click(function () {
        const userId = $(this).data('id');
        viewUserDetails(userId);
    });
}

function getRoleBadgeClass(role) {
    switch (role) {
        case 'admin':
            return 'danger';
        case 'photographer':
            return 'primary';
        case 'customer':
            return 'success';
        default:
            return 'secondary';
    }
}

function openBanUserModal(userId) {
    $('#ban-user-id').val(userId);
    $('#ban-reason').val('');
    $('#ban-duration').val('');
    $('#banUserModal').modal('show');
    $('#confirm-ban-btn').off('click').on('click', function () {
        banUser();
    });
}

function banUser() {
    const userId = $('#ban-user-id').val();
    const reason = $('#ban-reason').val();
    const duration = $('#ban-duration').val();

    if (!reason || !duration) {
        showToast('Error', 'Please fill all required fields', 'error');
        return;
    }

    $('#confirm-ban-btn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/users/ban`,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            user_id: userId,
            reason: reason,
            duration: duration
        }),
        success: function (response) {
            if (response.success) {
                $('#banUserModal').modal('hide');
                showToast('Success', 'User has been banned successfully', 'success');
                loadUsers(1, $('#user-search').val());
                loadDashboardStats();
                if ($('#ban-list').hasClass('show active')) {
                    loadBanList(1, $('#ban-search').val());
                }
            } else {
                showToast('Error', response.message || 'Failed to ban user', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        },
        complete: function () {
            $('#confirm-ban-btn').prop('disabled', false).text('Ban User');
        }
    });
}

function confirmUnbanUser(userId) {
    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/bans?search=${userId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success && response.data.length > 0) {
                const banRecord = response.data.find(ban => ban.user_id == userId);

                if (banRecord) {
                    $('#delete-item-id').val(banRecord.id);
                    $('#delete-item-type').val('ban');
                    $('#delete-confirmation-text').text(`Are you sure you want to unban user "${banRecord.user_name}"?`);
                    $('#confirmDeleteModal').modal('show');

                    $('#confirm-delete-btn').off('click').on('click', function () {
                        unbanUser(banRecord.id);
                    });
                } else {
                    showToast('Error', 'Ban record not found', 'error');
                }
            } else {
                showToast('Error', 'Failed to find ban record', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        }
    });
}

function unbanUser(banId) {
    $('#confirm-delete-btn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/bans/${banId}`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                $('#confirmDeleteModal').modal('hide');
                showToast('Success', 'User has been unbanned successfully', 'success');
                loadUsers(1, $('#user-search').val());
                loadDashboardStats();

                if ($('#ban-list').hasClass('show active')) {
                    loadBanList(1, $('#ban-search').val());
                }
            } else {
                showToast('Error', response.message || 'Failed to unban user', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        },
        complete: function () {
            $('#confirm-delete-btn').prop('disabled', false).text('Delete');
        }
    });
}

function viewUserDetails(userId) {
    $('#viewDetailsModal').modal('show');
    $('#viewDetailsModalLabel').text('User Details');
    $('#details-content').html('<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/users/${userId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                const user = response.data;
                let html = `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>ID:</strong> ${user.id}</p>
                            <p><strong>Name:</strong> ${user.name}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Role:</strong> <span class="badge bg-${getRoleBadgeClass(user.role)}">${user.role}</span></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Status:</strong> <span class="badge bg-${user.banned ? 'danger' : 'success'}">${user.banned ? 'Banned' : 'Active'}</span></p>
                            <p><strong>Registered:</strong> ${formatDateTime(user.created_at)}</p>
                            <p><strong>Last Updated:</strong> ${formatDateTime(user.updated_at)}</p>
                        </div>
                    </div>
                `;

                // Add photographer details if available
                if (user.photographer_profile) {
                    html += `
                        <hr>
                        <h5>Photographer Profile</h5>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Specialization:</strong> ${user.photographer_profile.specialization || 'N/A'}</p>
                                <p><strong>Experience:</strong> ${user.photographer_profile.experience_years || 0} years</p>
                                <p><strong>Location:</strong> ${user.photographer_profile.location || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Starting Price:</strong> €${user.photographer_profile.starting_price || 0}</p>
                                <p><strong>Rating:</strong> ${user.photographer_profile.average_rating || 'N/A'} (${user.photographer_profile.review_count || 0} reviews)</p>
                                <p><strong>Verified:</strong> ${user.photographer_profile.verified ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    `;
                }

                // Add ban details if user is banned
                if (user.banned && user.ban_details) {
                    const ban = user.ban_details;
                    html += `
                        <hr>
                        <h5>Ban Information</h5>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Reason:</strong> ${ban.reason}</p>
                                <p><strong>Duration:</strong> ${ban.duration === -1 ? 'Permanent' : ban.duration + ' days'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Banned On:</strong> ${formatDateTime(ban.created_at)}</p>
                                <p><strong>Expires:</strong> ${ban.expires_at ? formatDateTime(ban.expires_at) : 'Never'}</p>
                            </div>
                        </div>
                    `;
                }

                $('#details-content').html(html);
            } else {
                $('#details-content').html('<div class="alert alert-danger">Failed to load user details</div>');
            }
        },
        error: function (xhr) {
            $('#details-content').html('<div class="alert alert-danger">Error loading user details</div>');
            handleAjaxError(xhr);
        }
    });
}

function renderPagination(elementId, currentPage, lastPage, search = '', loadFunction) {
    let html = '';

    if (lastPage > 1) {
        html += `
            <li class="page-item ${currentPage == 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;

        if (currentPage > 3) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
                <li class="page-item disabled">
                    <a class="page-link" href="#">...</a>
                </li>
            `;
        }

        for (let i = Math.max(1, currentPage - 2); i <= Math.min(lastPage, currentPage + 2); i++) {
            html += `
                <li class="page-item ${i == currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        if (currentPage < lastPage - 2) {
            html += `
                <li class="page-item disabled">
                    <a class="page-link" href="#">...</a>
                </li>
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${lastPage}">${lastPage}</a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${currentPage == lastPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
    }

    $(`#${elementId}`).html(html);

    $(`#${elementId} .page-link`).click(function (e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (!isNaN(page) && page > 0) {
            loadFunction(page, search);
        }
    });
}

function loadComments(page = 1, search = '') {
    $('#comments-table').html('<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/comments?page=${page}&search=${search}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                renderCommentsTable(response.data);
                renderPagination('comments-pagination', page, response.meta.lastPage, search, loadComments);
            } else {
                showToast('Error', 'Failed to load comments', 'error');
                $('#comments-table').html('<tr><td colspan="7" class="text-center">Failed to load comments</td></tr>');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
            $('#comments-table').html('<tr><td colspan="7" class="text-center">Failed to load comments</td></tr>');
        }
    });
}

function renderCommentsTable(comments) {
    let html = '';
    
    if (comments.length === 0) {
        html = '<tr><td colspan="7" class="text-center">No comments found</td></tr>';
    } else {
        comments.forEach(comment => {
            html += `
                <tr>
                    <td>${comment.id}</td>
                    <td>${comment.user_name}</td>
                    <td>
                        <div class="text-truncate-custom" title="${escapeHtml(comment.content)}">
                            ${comment.title ? `<strong>${escapeHtml(comment.title)}</strong>: ` : ''}${escapeHtml(comment.content)}
                        </div>
                    </td>
                    <td>
                        <div class="rating">
                            ${generateStarRating(comment.rating)}
                        </div>
                    </td>
                    <td>${formatDate(comment.created_at)}</td>
                    <td>
                        <span class="badge bg-${comment.is_published ? 'success' : 'danger'}">
                            ${comment.is_published ? 'Published' : 'Hidden'}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-info view-comment-btn" data-id="${comment.id}" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${comment.is_published ? 
                            `<button class="btn btn-sm btn-warning hide-comment-btn" data-id="${comment.id}" title="Hide Comment">
                                <i class="bi bi-eye-slash"></i>
                            </button>` : 
                            `<button class="btn btn-sm btn-success show-comment-btn" data-id="${comment.id}" title="Show Comment">
                                <i class="bi bi-eye"></i>
                            </button>`
                        }
                        <button class="btn btn-sm btn-danger delete-comment-btn" data-id="${comment.id}" title="Delete Comment">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    $('#comments-table').html(html);

    $('.view-comment-btn').click(function() {
        const commentId = $(this).data('id');
        viewCommentDetails(commentId);
    });
    
    $('.hide-comment-btn').click(function() {
        const commentId = $(this).data('id');
        toggleCommentVisibility(commentId, false);
    });
    
    $('.show-comment-btn').click(function() {
        const commentId = $(this).data('id');
        toggleCommentVisibility(commentId, true);
    });
    
    $('.delete-comment-btn').click(function() {
        const commentId = $(this).data('id');
        confirmDeleteComment(commentId);
    });
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let html = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="bi bi-star-fill text-warning"></i>';
    }

    // Half star
    if (halfStar) {
        html += '<i class="bi bi-star-half text-warning"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="bi bi-star text-warning"></i>';
    }

    return html;
}

function viewCommentDetails(commentId) {
    $('#viewDetailsModal').modal('show');
    $('#viewDetailsModalLabel').text('Comment Details');
    $('#details-content').html('<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/comments/${commentId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                const comment = response.data;
                let html = `
                    <div class="card mb-3">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${escapeHtml(comment.user_name)}</strong> - ${formatDateTime(comment.created_at)}
                            </div>
                            <div class="badge bg-${comment.is_published ? 'success' : 'danger'}">
                                ${comment.is_published ? 'Published' : 'Hidden'}
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${escapeHtml(comment.title || 'Untitled')}</h5>
                            <div class="mb-2">
                                Rating: ${generateStarRating(comment.rating)} (${comment.rating})
                            </div>
                            <p class="card-text">${escapeHtml(comment.content)}</p>
                        </div>
                    </div>
                `;

                html += `
                    <div class="card mb-3">
                        <div class="card-header">
                            <strong>Photographer Information</strong>
                        </div>
                        <div class="card-body">
                            <p><strong>Name:</strong> ${escapeHtml(comment.photographer_name || 'N/A')}</p>
                            <p><strong>ID:</strong> ${comment.photographer_id}</p>
                        </div>
                    </div>
                `;

                html += `
                    <div class="d-flex justify-content-end">
                        ${comment.is_published ?
                        `<button class="btn btn-warning me-2 hide-comment-btn-modal" data-id="${comment.id}">
                                <i class="bi bi-eye-slash me-1"></i> Hide Comment
                            </button>` :
                        `<button class="btn btn-success me-2 show-comment-btn-modal" data-id="${comment.id}">
                                <i class="bi bi-eye me-1"></i> Show Comment
                            </button>`
                    }
                        <button class="btn btn-danger delete-comment-btn-modal" data-id="${comment.id}">
                            <i class="bi bi-trash me-1"></i> Delete Comment
                        </button>
                    </div>
                `;

                $('#details-content').html(html);
                $('.hide-comment-btn-modal').click(function () {
                    const id = $(this).data('id');
                    $('#viewDetailsModal').modal('hide');
                    toggleCommentVisibility(id, false);
                });

                $('.show-comment-btn-modal').click(function () {
                    const id = $(this).data('id');
                    $('#viewDetailsModal').modal('hide');
                    toggleCommentVisibility(id, true);
                });

                $('.delete-comment-btn-modal').click(function () {
                    const id = $(this).data('id');
                    $('#viewDetailsModal').modal('hide');
                    confirmDeleteComment(id);
                });
            } else {
                $('#details-content').html('<div class="alert alert-danger">Failed to load comment details</div>');
            }
        },
        error: function (xhr) {
            $('#details-content').html('<div class="alert alert-danger">Error loading comment details</div>');
            handleAjaxError(xhr);
        }
    });
}

function toggleCommentVisibility(commentId, isPublished) {
    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/comments/${commentId}/visibility`,
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            is_published: isPublished
        }),
        success: function (response) {
            if (response.success) {
                showToast('Success', `Comment has been ${isPublished ? 'published' : 'hidden'} successfully`, 'success');
                loadComments(1, $('#comment-search').val());
                loadDashboardStats();
            } else {
                showToast('Error', response.message || `Failed to ${isPublished ? 'publish' : 'hide'} comment`, 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        }
    });
}

function confirmDeleteComment(commentId) {
    $('#delete-item-id').val(commentId);
    $('#delete-item-type').val('comment');
    $('#delete-confirmation-text').text('Are you sure you want to delete this comment? This action cannot be undone.');
    $('#confirmDeleteModal').modal('show');

    $('#confirm-delete-btn').off('click').on('click', function () {
        deleteComment(commentId);
    });
}

function deleteComment(commentId) {
    $('#confirm-delete-btn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/comments/${commentId}`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                $('#confirmDeleteModal').modal('hide');
                showToast('Success', 'Comment has been deleted successfully', 'success');
                loadComments(1, $('#comment-search').val());
                loadDashboardStats();
            } else {
                showToast('Error', response.message || 'Failed to delete comment', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        },
        complete: function () {
            $('#confirm-delete-btn').prop('disabled', false).text('Delete');
        }
    });
}

function escapeHtml(html) {
    if (!html) return '';

    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function loadMessages(page = 1, search = '') {
    $('#messages-table').html('<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/messages?page=${page}&search=${search}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                renderMessagesTable(response.data);
                renderPagination('messages-pagination', page, response.meta.lastPage, search, loadMessages);
            } else {
                showToast('Error', 'Failed to load messages', 'error');
                $('#messages-table').html('<tr><td colspan="6" class="text-center">Failed to load messages</td></tr>');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
            $('#messages-table').html('<tr><td colspan="6" class="text-center">Failed to load messages</td></tr>');
        }
    });
}

function renderMessagesTable(messages) {
    let html = '';

    if (messages.length === 0) {
        html = '<tr><td colspan="6" class="text-center">No messages found</td></tr>';
    } else {
        messages.forEach(message => {
            html += `
                <tr>
                    <td>${message.id}</td>
                    <td>${escapeHtml(message.sender_name)}</td>
                    <td>${escapeHtml(message.recipient_name)}</td>
                    <td>
                        <div class="text-truncate-custom" title="${escapeHtml(message.content)}">
                            ${escapeHtml(message.content)}
                        </div>
                    </td>
                    <td>${formatDateTime(message.created_at)}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-info view-message-btn" data-id="${message.id}" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-message-btn" data-id="${message.id}" title="Delete Message">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    $('#messages-table').html(html);
    $('.view-message-btn').click(function () {
        const messageId = $(this).data('id');
        viewMessageDetails(messageId);
    });

    $('.delete-message-btn').click(function () {
        const messageId = $(this).data('id');
        confirmDeleteMessage(messageId);
    });
}

function viewMessageDetails(messageId) {
    $('#viewDetailsModal').modal('show');
    $('#viewDetailsModalLabel').text('Message Details');
    $('#details-content').html('<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/messages/${messageId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                const message = response.data;
                let html = `
                    <div class="card mb-3">
                        <div class="card-header">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <strong>From:</strong> ${escapeHtml(message.sender_name)}
                                </div>
                                <div>
                                    <strong>Date:</strong> ${formatDateTime(message.created_at)}
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <strong>To:</strong> ${escapeHtml(message.recipient_name)}
                            </div>
                            <div class="mb-3">
                                <strong>Conversation:</strong> ${message.conversation_subject ? escapeHtml(message.conversation_subject) : 'No subject'}
                            </div>
                            <div class="mb-3">
                                <strong>Message:</strong>
                                <div class="p-3 bg-light rounded">${escapeHtml(message.content)}</div>
                            </div>
                        </div>
                    </div>
                `;

                if (message.conversation && message.conversation.messages && message.conversation.messages.length > 0) {
                    html += `
                        <div class="card mb-3">
                            <div class="card-header">
                                <strong>Conversation History</strong>
                            </div>
                            <div class="card-body p-0">
                                <div class="list-group list-group-flush">
                    `;

                    message.conversation.messages.forEach(msg => {
                        const isCurrentMessage = msg.id === message.id;
                        html += `
                            <div class="list-group-item ${isCurrentMessage ? 'bg-light' : ''}">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <div>
                                        <strong>${escapeHtml(msg.sender_name)}</strong>
                                        ${isCurrentMessage ? '<span class="badge bg-primary ms-2">Current</span>' : ''}
                                    </div>
                                    <small>${formatDateTime(msg.created_at)}</small>
                                </div>
                                <div>${escapeHtml(msg.content)}</div>
                            </div>
                        `;
                    });

                    html += `
                                </div>
                            </div>
                        </div>
                    `;
                }

                html += `
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-danger delete-message-btn-modal" data-id="${message.id}">
                            <i class="bi bi-trash me-1"></i> Delete Message
                        </button>
                    </div>
                `;

                $('#details-content').html(html);
                $('.delete-message-btn-modal').click(function () {
                    const id = $(this).data('id');
                    $('#viewDetailsModal').modal('hide');
                    confirmDeleteMessage(id);
                });
            } else {
                $('#details-content').html('<div class="alert alert-danger">Failed to load message details</div>');
            }
        },
        error: function (xhr) {
            $('#details-content').html('<div class="alert alert-danger">Error loading message details</div>');
            handleAjaxError(xhr);
        }
    });
}

function confirmDeleteMessage(messageId) {
    $('#delete-item-id').val(messageId);
    $('#delete-item-type').val('message');
    $('#delete-confirmation-text').text('Are you sure you want to delete this message? This action cannot be undone.');
    $('#confirmDeleteModal').modal('show');

    $('#confirm-delete-btn').off('click').on('click', function () {
        deleteMessage(messageId);
    });
}

function deleteMessage(messageId) {
    $('#confirm-delete-btn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/messages/${messageId}`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                $('#confirmDeleteModal').modal('hide');
                showToast('Success', 'Message has been deleted successfully', 'success');
                loadMessages(1, $('#message-search').val());
            } else {
                showToast('Error', response.message || 'Failed to delete message', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        },
        complete: function () {
            $('#confirm-delete-btn').prop('disabled', false).text('Delete');
        }
    });
}

function loadBanList(page = 1, search = '') {
    $('#ban-list-table').html('<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/bans?page=${page}&search=${search}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                renderBanListTable(response.data);
                renderPagination('ban-list-pagination', page, response.meta.lastPage, search, loadBanList);
            } else {
                showToast('Error', 'Failed to load ban list', 'error');
                $('#ban-list-table').html('<tr><td colspan="7" class="text-center">Failed to load ban list</td></tr>');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
            $('#ban-list-table').html('<tr><td colspan="7" class="text-center">Failed to load ban list</td></tr>');
        }
    });
}

function renderBanListTable(bans) {
    let html = '';

    if (bans.length === 0) {
        html = '<tr><td colspan="7" class="text-center">No banned users found</td></tr>';
    } else {
        bans.forEach(ban => {
            const isPermanent = ban.duration === -1;
            const expiryDate = isPermanent ? 'Never' : formatDate(ban.expires_at);

            html += `
                <tr>
                    <td>${ban.id}</td>
                    <td>${escapeHtml(ban.user_name)}</td>
                    <td>
                        <div class="text-truncate-custom" title="${escapeHtml(ban.reason)}">
                            ${escapeHtml(ban.reason)}
                        </div>
                    </td>
                    <td>${formatDate(ban.created_at)}</td>
                    <td>${isPermanent ? 'Permanent' : ban.duration + ' days'}</td>
                    <td>${expiryDate}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-info view-ban-btn" data-id="${ban.id}" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success unban-user-btn" data-id="${ban.id}" title="Unban User">
                            <i class="bi bi-unlock"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    $('#ban-list-table').html(html);
    $('.view-ban-btn').click(function () {
        const banId = $(this).data('id');
        viewBanDetails(banId);
    });

    $('.unban-user-btn').click(function () {
        const banId = $(this).data('id');
        confirmUnbanUserFromList(banId);
    });
}

function viewBanDetails(banId) {
    $('#viewDetailsModal').modal('show');
    $('#viewDetailsModalLabel').text('Ban Details');
    $('#details-content').html('<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/bans/${banId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                const ban = response.data;
                const isPermanent = ban.duration === -1;

                let html = `
                    <div class="card mb-3">
                        <div class="card-header bg-danger text-white">
                            <h5 class="mb-0">Ban Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>User:</strong> ${escapeHtml(ban.user_name)}</p>
                                    <p><strong>Banned By:</strong> ${escapeHtml(ban.banned_by)}</p>
                                    <p><strong>Ban Date:</strong> ${formatDateTime(ban.created_at)}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Duration:</strong> ${isPermanent ? 'Permanent' : ban.duration + ' days'}</p>
                                    <p><strong>Expires:</strong> ${isPermanent ? 'Never' : formatDateTime(ban.expires_at)}</p>
                                    <p><strong>Status:</strong> 
                                        <span class="badge bg-danger">Active</span>
                                    </p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <h6>Reason:</h6>
                                <div class="p-3 bg-light rounded">${escapeHtml(ban.reason)}</div>
                            </div>
                        </div>
                    </div>
                `;

                if (ban.user_details) {
                    const user = ban.user_details;
                    html += `
                        <div class="card mb-3">
                            <div class="card-header">
                                <h5 class="mb-0">User Information</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>ID:</strong> ${user.id}</p>
                                        <p><strong>Name:</strong> ${escapeHtml(user.name)}</p>
                                        <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Role:</strong> ${user.role}</p>
                                        <p><strong>Registered:</strong> ${formatDate(user.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                html += `
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-success unban-user-btn-modal" data-id="${ban.id}">
                            <i class="bi bi-unlock me-1"></i> Unban User
                        </button>
                    </div>
                `;

                $('#details-content').html(html);
                $('.unban-user-btn-modal').click(function () {
                    const id = $(this).data('id');
                    $('#viewDetailsModal').modal('hide');
                    confirmUnbanUserFromList(id);
                });
            } else {
                $('#details-content').html('<div class="alert alert-danger">Failed to load ban details</div>');
            }
        },
        error: function (xhr) {
            $('#details-content').html('<div class="alert alert-danger">Error loading ban details</div>');
            handleAjaxError(xhr);
        }
    });
}

function confirmUnbanUserFromList(banId) {
    $('#delete-item-id').val(banId);
    $('#delete-item-type').val('ban');
    $('#delete-confirmation-text').text('Are you sure you want to unban this user?');
    $('#confirmDeleteModal').modal('show');

    $('#confirm-delete-btn').off('click').on('click', function () {
        unbanUserFromList(banId);
    });
}

function unbanUserFromList(banId) {
    $('#confirm-delete-btn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/bans/${banId}`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                $('#confirmDeleteModal').modal('hide');
                showToast('Success', 'User has been unbanned successfully', 'success');

                loadBanList(1, $('#ban-search').val());
                loadDashboardStats();

                if ($('#users').hasClass('show active')) {
                    loadUsers(1, $('#user-search').val());
                }
            } else {
                showToast('Error', response.message || 'Failed to unban user', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        },
        complete: function () {
            $('#confirm-delete-btn').prop('disabled', false).text('Delete');
        }
    });
}

function loadLogs(page = 1) {
    $('#logs-table').html('<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/logs?page=${page}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                renderLogsTable(response.data);
                renderPagination('logs-pagination', page, response.meta.lastPage, '', loadLogs);
            } else {
                showToast('Error', 'Failed to load system logs', 'error');
                $('#logs-table').html('<tr><td colspan="7" class="text-center">Failed to load system logs</td></tr>');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
            $('#logs-table').html('<tr><td colspan="7" class="text-center">Failed to load system logs</td></tr>');
        }
    });
}

function renderLogsTable(logs) {
    let html = '';

    if (logs.length === 0) {
        html = '<tr><td colspan="7" class="text-center">No logs found</td></tr>';
    } else {
        logs.forEach(log => {
            html += `
                <tr>
                    <td>${log.id}</td>
                    <td>
                        <span class="badge bg-${getLogTypeBadgeClass(log.type)}">${log.type}</span>
                    </td>
                    <td>${escapeHtml(log.action)}</td>
                    <td>${escapeHtml(log.user_name || 'System')}</td>
                    <td>${log.ip_address}</td>
                    <td>${formatDateTime(log.created_at)}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-info view-log-btn" data-id="${log.id}" title="View Details">
                            <i class="bi bi-info-circle"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    $('#logs-table').html(html);
    $('.view-log-btn').click(function () {
        const logId = $(this).data('id');
        viewLogDetails(logId);
    });
}

function getLogTypeBadgeClass(type) {
    switch (type.toLowerCase()) {
        case 'admin':
            return 'danger';
        case 'auth':
            return 'primary';
        case 'user':
            return 'success';
        case 'system':
            return 'info';
        default:
            return 'secondary';
    }
}

function viewLogDetails(logId) {
    $('#viewDetailsModal').modal('show');
    $('#viewDetailsModalLabel').text('Log Details');
    $('#details-content').html('<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/logs/${logId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                const log = response.data;
                let html = `
                    <div class="card mb-3">
                        <div class="card-header bg-${getLogTypeBadgeClass(log.type)} text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Log Event</h5>
                                <span class="badge bg-light text-dark">ID: ${log.id}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Type:</strong> <span class="badge bg-${getLogTypeBadgeClass(log.type)}">${log.type}</span></p>
                                    <p><strong>Action:</strong> ${escapeHtml(log.action)}</p>
                                    <p><strong>User:</strong> ${escapeHtml(log.user_name || 'System')}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>IP Address:</strong> ${log.ip_address}</p>
                                    <p><strong>Date:</strong> ${formatDateTime(log.created_at)}</p>
                                </div>
                            </div>
                `;

                // Add details if available
                if (log.details) {
                    let detailsObj;
                    try {
                        detailsObj = JSON.parse(log.details);
                        html += `
                            <div class="mt-3">
                                <h6>Additional Details:</h6>
                                <div class="p-3 bg-light rounded">
                                    <pre class="mb-0">${JSON.stringify(detailsObj, null, 2)}</pre>
                                </div>
                            </div>
                        `;
                    } catch (e) {
                        html += `
                            <div class="mt-3">
                                <h6>Additional Details:</h6>
                                <div class="p-3 bg-light rounded">${escapeHtml(log.details)}</div>
                            </div>
                        `;
                    }
                }

                html += `
                        </div>
                    </div>
                `;

                $('#details-content').html(html);
            } else {
                $('#details-content').html('<div class="alert alert-danger">Failed to load log details</div>');
            }
        },
        error: function (xhr) {
            $('#details-content').html('<div class="alert alert-danger">Error loading log details</div>');
            handleAjaxError(xhr);
        }
    });
}

function clearLogs() {
    if (!confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
        return;
    }

    $.ajax({
        url: `${CONFIG.API.BASE_URL}/admin/logs/clear`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            if (response.success) {
                showToast('Success', 'System logs have been cleared successfully', 'success');

                // Refresh the logs table
                loadLogs(1);
            } else {
                showToast('Error', response.message || 'Failed to clear logs', 'error');
            }
        },
        error: function (xhr) {
            handleAjaxError(xhr);
        }
    });
}


