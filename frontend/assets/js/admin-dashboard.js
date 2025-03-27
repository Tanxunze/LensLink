// When the page has finished loading
document.addEventListener("DOMContentLoaded", () => {
    // Activate the last visited tab
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        const tab = document.querySelector(`a[href="${savedTab}"]`);
        if (tab) new bootstrap.Tab(tab).show();
    }

    // User search function (Ban Users page only)
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const value = this.value.toLowerCase();
            document.querySelectorAll("#banUsers tbody tr").forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(value) ? "" : "none";
            });
        });
    }

    // Resumption of topic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// Save current tab state when switching tabs
document.querySelectorAll('[data-bs-toggle="tab"]').forEach(el => {
    el.addEventListener('shown.bs.tab', e => {
        localStorage.setItem('activeTab', e.target.getAttribute('href'));
    });
});

// user-blocking feature
function banUser(name, duration) {
    if (confirm(`Are you sure you want to ban ${name} for ${duration
