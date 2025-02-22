const CONFIG = {
    BASE_URL: window.location.pathname.includes("/pages/auth/")
    ? "../../"
    : window.location.pathname.includes("/pages/")
    ? "../"
    : "./",

    needsComponents: function() {
        return !window.location.pathname.includes('/pages/dashboard/');
    },

    API: {
        BASE_URL: "",
        VERSION: "v1",
    },
};
