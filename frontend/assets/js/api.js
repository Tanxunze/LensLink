/* Note: Please use the following standard comment style for each js function so that it can be read and modified by other contributors. -Xunze
* Description: A brief description of the function.
* Input parameter: @param {type} name - description
* Output parameter: @returns {type} - description
*/ 
class API {
    /**
     * Send a general API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} - Request response Promise
     */
    static async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json", 
                "Authorization": localStorage.getItem("token")
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
            console.error(`API request failed (${endpoint}):`, error);
            // Enhance error object
            error.endpoint = endpoint;
            error.requestOptions = options;
            throw error;
        }
    }

    // Authentication APIs
    /**
     * User login
     * @param {Object} credentials - Login credentials
     * @returns {Promise} - Login response
     */
    static async login(credentials) {
        return this.request("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(credentials),
        });
    }

    /**
 * Redirect to Google login page
 * @returns {string} - Redirect URL
 */
    static getGoogleAuthURL() {
        return `${CONFIG.API.BASE_URL}/auth/google/redirect`;
    }

    /**
     * Handle Google login callback
     * @param {string} code - Authorization code
     * @returns {Promise} - Login response
     */
    static async handleGoogleCallback(code) {
        return this.request(`/auth/google/callback?code=${code}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
    }

    /**
     * User registration
     * @param {Object} userData - User data
     * @returns {Promise} - Registration response
     */
    static async register(userData) {
        return this.request("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(userData),
        });
    }

    /**
     * Verify authentication token
     * @returns {Promise} - Verification response
     */
    static async verifyToken() {
        return this.request("/auth/verify");
    }

    /**
     * User logout
     * @returns {Promise} - Logout response
     */
    static async logout() {
        return this.request("/auth/logout", {
            method: "POST"
        });
    }

    static async changePassword(passwordData) {
        return this.request('/auth/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    }

    // User Profile APIs
    /**
     * Get user profile
     * @returns {Promise} - User profile
     */
    static async getUserProfile() {
        return this.request("/user/profile");
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile data
     * @returns {Promise} - Update response
     */
    static async updateUserProfile(profileData) {
        return this.request("/user/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    }

    /**
     * Update profile image
     * @param {FormData} formData - Form data containing the image
     * @returns {Promise} - Update response
     */
    static async updateProfileImage(formData) {
        return $.ajax({
            url: `${CONFIG.API.BASE_URL}/user/profile/image`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "Authorization": localStorage.getItem("token")
                    ? `Bearer ${localStorage.getItem("token")}`
                    : "",
            }
        });
    }

    // Photographer APIs
    /**
     * Get photographers list
     * @param {Object} params - Query parameters
     * @returns {Promise} - Photographers list
     */
    static async getPhotographers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/photographers${queryString ? `?${queryString}` : ''}`);
    }

    /**
     * Get photographer profile
     * @param {number} id - Photographer ID
     * @returns {Promise} - Photographer profile
     */
    static async getPhotographerProfile(id) {
        return this.request(`/photographers/${id}`);
    }

    /**
     * Get photographer services
     * @param {number} id - Photographer ID
     * @returns {Promise} - Photographer services
     */
    static async getPhotographerServices(id) {
        return this.request(`/photographers/${id}/services`);
    }

    // Services
    /**
     * Get all services
     * @param {Object} params - Filter parameters (category, featured, sort, page, limit, etc.)
     * @returns {Promise} - Services list
     */
    static async getServices(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/services${queryString ? `?${queryString}` : ''}`);
    }

    /**
     * Get service details
     * @param {number} id - Service ID
     * @returns {Promise} - Service details
     */
    static async getServiceDetails(id) {
        return this.request(`/services/${id}`);
    }

    /**
     * Create new service (Photographer)
     * @param {Object} serviceData - Service data
     * @returns {Promise} - Creation response
     */
    static async createService(serviceData) {
        return this.request("/services", {
            method: "POST",
            body: JSON.stringify(serviceData),
        });
    }

    /**
     * Update service (Photographer)
     * @param {number} id - Service ID
     * @param {Object} serviceData - Update data
     * @returns {Promise} - Update response
     */
    static async updateService(id, serviceData) {
        return this.request(`/services/${id}`, {
            method: "PUT",
            body: JSON.stringify(serviceData),
        });
    }

    /**
     * Delete service (Photographer)
     * @param {number} id - Service ID
     * @returns {Promise} - Delete response
     */
    static async deleteService(id) {
        return this.request(`/services/${id}`, {
            method: "DELETE",
        });
    }

    // Booking
    /**
     * Create booking
     * @param {Object} bookingData - Booking data
     * @returns {Promise} - Creation response
     */
    static async createBooking(bookingData) {
        return this.request("/bookings", {
            method: "POST",
            body: JSON.stringify(bookingData),
        });
    }

    /**
     * Get bookings list
     * @param {Object} params - Query parameters
     * @returns {Promise} - Bookings list
     */
    static async getBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/bookings${queryString ? `?${queryString}` : ''}`);
    }

    /**
     * Get booking details
     * @param {number} id - Booking ID
     * @returns {Promise} - Booking details
     */
    static async getBookingDetails(id) {
        return this.request(`/bookings/${id}`);
    }

    /**
     * Cancel booking
     * @param {number} id - Booking ID
     * @returns {Promise} - Cancel response
     */
    static async cancelBooking(id) {
        return this.request(`/bookings/${id}/cancel`, {
            method: "PUT"
        });
    }

    /**
    * Get count of bookings by status
    * @param {string} status - Booking status
    * @returns {Promise} - Count response
    */
    static async getBookingsCount(status) {
        return this.request(`/bookings/count${status ? `?status=${status}` : ''}`);
    }

    /**
     * Get bookings list
     * @param {Object} params - Query parameters (status, search, page, limit, sort_field, sort_order)
     * @returns {Promise} - Bookings list
     */
    static async getBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/bookings${queryString ? `?${queryString}` : ''}`);
    }

    // Review APIs

    /**
     * Create a review
     * @param {Object} reviewData - Review data
     * @returns {Promise} - Creation response
     */
    static async createReview(reviewData) {
        return this.request("/reviews", {
            method: "POST",
            body: JSON.stringify(reviewData),
        });
    }

    /**
     * Get reviews list
     * @param {Object} params - Query parameters
     * @returns {Promise} - Reviews list
     */
    static async getReviews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/reviews${queryString ? `?${queryString}` : ''}`);
    }

    /**
     * Get review details
     * @param {number} id - Review ID
     * @returns {Promise} - Review details
     */
    static async getReviewDetails(id) {
        return this.request(`/reviews/${id}`);
    }

    /**
     * Reply to review (Photographer)
     * @param {number} id - Review ID
     * @param {string} reply - Reply content
     * @returns {Promise} - Reply response
     */
    static async replyToReview(id, reply) {
        return this.request(`/reviews/${id}/reply`, {
            method: "POST",
            body: JSON.stringify({ reply }),
        });
    }

    // Message APIs
    /**
     * Get conversations list
     * @returns {Promise} - Conversations list
     */
    static async getConversations() {
        return this.request("/messages/conversations");
    }

    /**
     * Get conversation messages
     * @param {number} id - Conversation ID
     * @param {Object} params - Query parameters
     * @returns {Promise} - Conversation messages
     */
    static async getConversationMessages(id, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/messages/conversation/${id}${queryString ? `?${queryString}` : ''}`);
    }

    /**
     * Send message
     * @param {Object} messageData - Message data
     * @returns {Promise} - Send response
     */
    static async sendMessage(messageData) {
        return this.request("/messages", {
            method: "POST",
            body: JSON.stringify(messageData),
        });
    }

    /**
     * Mark messages as read
     * @param {number} conversationId - Conversation ID
     * @returns {Promise} - Mark read response
     */
    static async markMessagesAsRead(conversationId) {
        return this.request("/messages/mark-as-read", {
            method: "POST",
            body: JSON.stringify({ conversation_id: conversationId }),
        });
    }

    /**
     * Reply to an existing conversation
     * @param {Object} replyData - Reply data (conversation_id and message)
     * @returns {Promise} - Reply response
     */
    static async replyToConversation(replyData) {
        return this.request("/messages/reply", {
            method: "POST",
            body: JSON.stringify(replyData),
        });
    }

    /**
    * Get count of unread messages
    * @returns {Promise} - Count response
    */
    static async getUnreadMessagesCount() {
        return this.request('/messages/count?unread=true');
    }

    /**
     * Get available categories
     * @returns {Promise} - Categories list
     */
    static async getCategories() {
        return this.request("/categories");
    }

    /**
     * Get sorting options for a specific entity
     * @param {string} entity - Entity type (photographers, services, etc.)
     * @returns {Promise} - Sort options
     */
    static async getSortOptions(entity) {
        return this.request(`/sort-options/${entity}`);
    }

    /**
     * Get rating filter options
     * @returns {Promise} - Rating options
     */
    static async getRatingOptions() {
        return this.request("/rating-options");
    }
    
    /**
    * Get recommended photographers
    * @param {number} limit - Maximum number of photographers to return
    * @returns {Promise} - Recommended photographers
    */
    static async getRecommendedPhotographers(limit = 3) {
        return this.request(`/photographers/recommended?limit=${limit}`);
    }

    /**
     * Get favorite photographers list
     * @returns {Promise} - Favorite photographers list
     */
    static async getSavedPhotographers() {
        return this.request("/favorites");
    }

    /**
     * Add a photographer to favorites
     * @param {number} photographerId - Photographer ID
     * @returns {Promise} - Add result
     */
    static async addToFavorites(photographerId) {
        return this.request("/favorites", {
            method: "POST",
            body: JSON.stringify({ photographer_id: photographerId }),
        });
    }

    /**
     * Remove a photographer from favorites
     * @param {number} photographerId - Photographer ID
     * @returns {Promise} - result
     */
    static async removeFromFavorites(photographerId) {
        return this.request(`/favorites/${photographerId}`, {
            method: "DELETE"
        });
    }


    /**
     * Check if a photographer is in favorites
     * @param {number} photographerId - Photographer ID
     * @returns {Promise} - Result
     */
    static async checkFavoriteStatus(photographerId) {
        return this.request(`/favorites/check/${photographerId}`);
    }

    /**
     * Get user's detailed profile
     * @returns {Promise} - User detailed profile
     */
    static async getUserDetailedProfile() {
        return this.request("/user/profile");
    }

    /**
     * Update user's profile
     * @param {Object} profileData - Profile data
     * @returns {Promise} - Result
     */
    static async updateUserProfile(profileData) {
        return this.request("/user/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    }

    /**
     * Update user's profile image
     * @param {FormData} formData - Form data containing the image
     * @returns {Promise} - Result
     */
    static async updateProfileImage(formData) {
        return $.ajax({
            url: `${CONFIG.API.BASE_URL}/user/profile/image`,
            type: "POST",
            data: formData,
            processData: false, 
            contentType: false, 
            headers: {
                "Authorization": localStorage.getItem("token")
                    ? `Bearer ${localStorage.getItem("token")}`
                    : "",
            }
        });
    }
}
