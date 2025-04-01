document.addEventListener("DOMContentLoaded", () => {
    // Save the current Tab state
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        const tab = document.querySelector(`a[href="${savedTab}"]`);
        if (tab) new bootstrap.Tab(tab).show();
    }

    // Theme recovery
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    // search function
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const value = this.value.toLowerCase();
            document.querySelectorAll("#banUsers tbody tr").forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(value) ? "" : "none";
            });
        });
    }

    // Binding Toggle Tab Save
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(el => {
        el.addEventListener('shown.bs.tab', e => {
            localStorage.setItem('activeTab', e.target.getAttribute('href'));
        });
    });

    // Load dynamic data
    fetchStats();
    fetchRecentUsers();
    fetchLogs();
    fetchComments();
});

function fetchStats() {
    fetch("/api/admin/stats")
        .then(res => res.json())
        .then(data => {
            document.getElementById("totalUsers").textContent = data.total_users;
            document.getElementById("totalPhotographers").textContent = data.total_photographers;
            document.getElementById("pendingApprovals").textContent = data.pending_approvals;
            document.getElementById("revenue").textContent = `€${(data.revenue / 1000).toFixed(1)}k`;
        });
}

function fetchRecentUsers() {
    fetch("/api/admin/recent-users")
        .then(res => res.json())
        .then(users => {
            const tbody = document.querySelector("#recentUsersTable tbody");
            tbody.innerHTML = "";
            users.forEach((u, index) => {
                tbody.innerHTML += `
                    <tr>
                        <th>${index + 1}</th>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.registered_at}</td>
                        <td><span class="badge bg-${u.status === 'Active' ? 'success' : 'warning'}">${u.status}</span></td>
                    </tr>`;
            });
        });
}

function fetchLogs() {
    fetch("/api/admin/logs")
        .then(res => res.json())
        .then(logs => {
            const tbody = document.querySelector("#logsTable tbody");
            tbody.innerHTML = "";
            logs.forEach((log, index) => {
                tbody.innerHTML += `
                    <tr>
                        <th>${index + 1}</th>
                        <td>${log.action}</td>
                        <td>${log.admin}</td>
                        <td>${log.date}</td>
                    </tr>`;
            });
        });
}

function fetchComments() {
    fetch("/api/admin/comments")
        .then(res => res.json())
        .then(comments => {
            const tbody = document.querySelector("#commentsTable tbody");
            tbody.innerHTML = "";
            comments.forEach((c, index) => {
                tbody.innerHTML += `
                    <tr>
                        <th>${index + 1}</th>
                        <td>${c.user}</td>
                        <td>${c.comment}</td>
                        <td><button class="btn btn-danger btn-sm" onclick="deleteComment(${c.id})">Delete</button></td>
                    </tr>`;
            });
        });
}

function deleteComment(id) {
    if (confirm("Confirm delete this comment?")) {
        fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
            .then(() => fetchComments());
    }
}

function banUser(name, duration) {
    if (confirm(`Ban ${name} for ${duration}?`)) {
        fetch(`/api/admin/ban/${name}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ duration })
        }).then(() => alert(`User ${name} banned for ${duration}`));
    }
}