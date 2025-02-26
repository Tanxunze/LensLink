class API {
    static async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token")
                    ? `Bearer ${localStorage.getItem("token")}`
                    : "",
            },
            credentials: "include",
        };

        try {
            return $.ajax({
                url: `${CONFIG.API.BASE_URL}${endpoint}`,
                type: options.method || "GET",
                contentType: "application/json",
                headers: {
                    ...defaultOptions.headers,
                    ...(options.headers || {}),
                },
                data: options.body,
                dataType: "json",
                credentials: defaultOptions.credentials,
            });
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    // auth
    static async login(credentials) {
        return this.request("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(credentials),
        });
    }

    static async register(userData) {
        return this.request("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(userData),
        });
    }

    static async verifyToken() {
        return this.request("/auth/verify");
    }

    // userinfo
    static async getUserProfile() {
        return this.request("/user/profile");
    }

    static async updateUserProfile(profileData) {
        return this.request("/user/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    }

    // photographer
    static async getPhotographers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/photographers?${queryString}`);
    }

    static async getPhotographerProfile(id) {
        return this.request(`/photographers/${id}`);
    }

    static async getPhotographerServices(id) {
        return this.request(`/photographers/${id}/services`);
    }

    //   // booking
    //   static async createBooking(bookingData) {
    //     return this.request("/bookings", {
    //       method: "POST",
    //       body: JSON.stringify(bookingData),
    //     });
    //   }

    //   static async getBookings() {
    //     return this.request("/bookings");
    //   }
}
//Due to the complexity and sheer volume of the dashboard's js, they have been moved to separate js files.