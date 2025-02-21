const CONFIG = {
    BASE_URL: window.location.pathname.includes("/pages/auth/")
    ? "../../"
    : window.location.pathname.includes("/pages/")
    ? "../"
    : "./",

    API: {
        BASE_URL: "",
        VERSION: "v1",
    },
};
