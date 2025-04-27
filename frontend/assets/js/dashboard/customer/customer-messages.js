const CustomerMessages = {
    init: function() {
        this.setupEventHandlers();
    },

    setupEventHandlers: function() {
        // Message management
        $("#newMessageBtn").click(function (e) {
            e.preventDefault();
            CustomerMessages.openNewMessageModal();
        });

        $("#sendNewMessageBtn").click(function () {
            CustomerMessages.sendNewMessage();
        });

        $("#sendMessageForm").submit(function (e) {
            e.preventDefault();
            CustomerMessages.sendMessage();
        });

        $("#markAsReadBtn").click(function(e) {
            e.preventDefault();
            const conversationId = $("#sendMessageForm").data("conversation-id");
            const conversationType = $("#sendMessageForm").data("conversation-type");

            if (!conversationId) return;

            if (conversationType === 'customer') {
                CustomerMessages.markCustomerMessagesAsRead(conversationId);
            } else {
                CustomerMessages.markMessagesAsRead(conversationId);
            }

            showNotification("Messages marked as read", "success");
        });

        $("#viewPhotographerProfileBtn").click(function(e) {
            e.preventDefault();
            const conversationId = $("#sendMessageForm").data("conversation-id");
            const conversation = window.conversationsData.find(c => c.id == conversationId);

            if (conversation && conversation.photographer && conversation.photographer.id) {
                window.open(`../../pages/photographer-detail.html?id=${conversation.photographer.id}`, '_blank');
            } else {
                showNotification("Could not find photographer profile", "warning");
            }
        });
    },

    showMessagesSection: function() {
        $(".nav-link").removeClass("active");
        $('[data-section="messages"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#messagesSection").removeClass("d-none");
        this.loadMessages();
        window.location.hash = "messages";
    },

    loadMessages: function() {
        $("#conversationsList").html(`
            <div class="text-center p-3">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading conversations...</span>
            </div>
        `);

        $("#conversationTitle").text("Select a conversation");
        $("#messagesContainer").html(`
            <div class="text-center p-5">
                <i class="bi bi-chat-dots display-4 text-muted"></i>
                <p class="mt-3">Select a conversation to view messages</p>
            </div>
        `);
        $("#messageInputContainer").addClass("d-none");
        $("#conversationMenu").addClass("d-none");
        CustomerContacts.loadPendingContactRequests();

        Promise.all([
            API.getConversations().catch(error => {
                console.error("Failed to load photographer conversations:", error);
                return { length: 0 };
            }),
            API.getCustomerConversations().catch(error => {
                console.error("Failed to load customer conversations:", error);
                return { conversations: [] };
            })
        ])
            .then(([photographerConversations, customerData]) => {
                const photogConvs = Array.isArray(photographerConversations) ? photographerConversations : [];
                const customerConvs = customerData && Array.isArray(customerData.conversations)
                    ? customerData.conversations.map(conv => {
                        if (!conv.id && conv.conversation_id) {
                            conv.id = conv.conversation_id;
                        }
                        return {...conv, type: 'customer'};
                    }) : [];

                const allConversations = [
                    ...photogConvs.map(conv => ({...conv, type: 'photographer'})),
                    ...customerConvs.map(conv => ({...conv, type: 'customer'}))
                ];

                allConversations.sort((a, b) => {
                    const timeA = a.last_message_time || a.updated_at || a.created_at;
                    const timeB = b.last_message_time || b.updated_at || b.created_at;
                    return new Date(timeB) - new Date(timeA);
                });

                window.conversationsData = allConversations;

                if (allConversations.length === 0) {
                    $("#conversationsList").html(`
                    <div class="p-3 text-center">
                        <p class="text-muted">No conversations yet</p>
                        <button class="btn btn-sm btn-outline-primary" id="startNewConversationBtn">
                            Start a new conversation
                        </button>
                    </div>
                `);

                    $("#startNewConversationBtn").click(function() {
                        CustomerMessages.openNewMessageModal();
                    });
                    return;
                }

                const conversationsHtml = allConversations.map(conversation => {
                    let otherPartyName, otherPartyImage, unreadCount;

                    if (conversation.type === 'photographer') {
                        const photographer = conversation.photographer || {};
                        const user = photographer.user || {};
                        otherPartyName = user.name || 'Photographer';
                        otherPartyImage = user.profile_image || '../../assets/images/default-photographer.jpg';
                        unreadCount = conversation.unread_count || 0;
                    } else {
                        const participant = conversation.participant || {};
                        otherPartyName = participant.name || 'User';
                        otherPartyImage = participant.profile_image || '../../assets/images/default-avatar.jpg';
                        unreadCount = conversation.unread_count || 0;
                    }

                    let lastMessageTime, lastMessageText;
                    if (conversation.type === 'photographer') {
                        lastMessageTime = formatDate(conversation.last_message_time || conversation.created_at);
                        lastMessageText = conversation.last_message || 'No messages yet';
                    } else {
                        lastMessageTime = formatDate(conversation.latest_message?.time || conversation.created_at);
                        lastMessageText = conversation.latest_message?.content || 'No messages yet';
                    }

                    const unreadClass = unreadCount > 0 ? 'fw-bold' : '';
                    const unreadBadge = unreadCount > 0
                        ? `<span class="badge bg-danger rounded-pill ms-2">${unreadCount}</span>`
                        : '';

                    return `
                    <a href="#" class="list-group-item list-group-item-action conversation-item ${unreadClass}" 
                       data-id="${conversation.id}"
                       data-type="${conversation.type}"
                       data-other-name="${otherPartyName}">
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img src="${otherPartyImage}" class="rounded-circle me-2" width="32" height="32" alt="${otherPartyName}">
                                <h6 class="mb-1">${otherPartyName} ${unreadBadge}</h6>
                            </div>
                            <small class="text-muted">${lastMessageTime}</small>
                        </div>
                        <p class="mb-1 text-truncate ps-4">${lastMessageText}</p>
                        ${conversation.type === 'customer' ?
                        '<div class="mt-1 ps-4"><span class="badge bg-info">Customer</span></div>' : ''}
                    </a>
                `;
                }).join('');

                $("#conversationsList").html(conversationsHtml);

                $(".conversation-item").click(function(e) {
                    e.preventDefault();
                    const conversationId = $(this).data("id");
                    const conversationType = $(this).data("type");
                    const otherName = $(this).data("other-name");

                    if (!conversationId) {
                        console.error("Missing conversation ID");
                        return;
                    }
                    $("#sendMessageForm").data("conversation-id", conversationId);
                    $("#sendMessageForm").data("conversation-type", conversationType);
                    $("#conversationTitle").text(otherName);
                    $(this).removeClass("fw-bold")
                        .find(".badge").not(".bg-info").remove();

                    $(".conversation-item").removeClass("active");
                    $(this).addClass("active");

                    $("#conversationMenu").removeClass("d-none");

                    if (conversationType === 'customer') {
                        CustomerMessages.loadCustomerConversation(conversationId);
                    } else {
                        CustomerMessages.loadConversation(conversationId);
                        CustomerMessages.markMessagesAsRead(conversationId);
                    }
                });
            })
            .catch(error => {
                console.error("Failed to load conversations:", error);
                $("#conversationsList").html(`
                <div class="alert alert-danger m-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Failed to load conversations. Please try again.
                </div>
            `);
            });
    },

    loadCustomerConversation: function(conversationId) {
        if (!conversationId) {
            console.error("Invalid conversation ID");
            $("#messagesContainer").html(`
                <div class="text-center p-5">
                    <i class="bi bi-exclamation-triangle text-warning display-4"></i>
                    <p class="mt-3">Could not load this conversation</p>
                </div>
            `);
            return;
        }

        $("#messagesContainer").html(`
            <div class="text-center p-3">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading messages...</p>
            </div>
        `);

        API.getCustomerConversationMessages(conversationId)
            .then(data => {
                $("#messageInputContainer").removeClass("d-none");

                const messages = data.messages || [];
                const otherParticipant = data.participant || {};

                $("#conversationTitle").text(otherParticipant.name || "Conversation");
                $("#conversationMenu").removeClass("d-none");

                if (!messages.length) {
                    $("#messagesContainer").html(`
                        <div class="text-center p-5">
                            <p class="text-muted">No messages yet</p>
                            <p class="text-muted small">Start the conversation by sending a message below</p>
                        </div>
                    `);
                    return;
                }

                const messagesHtml = messages.map(message => {
                    const isCurrentUser = message.is_mine;
                    const alignClass = isCurrentUser ? 'justify-content-end' : 'justify-content-start';
                    const bgColor = isCurrentUser ? '#007bff' : '#f1f1f1';
                    const textColor = isCurrentUser ? '#fff' : '#000';

                    const time = formatTime(message.created_at);
                    const date = formatDate(message.created_at);

                    return `
                        <div class="d-flex ${alignClass} mb-3">
                            <div class="message-bubble" style="background: ${bgColor}; color: ${textColor}; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                                <div class="message-content">
                                    <p class="mb-0">${message.message}</p>
                                    <small class="d-block text-${isCurrentUser ? 'end' : 'start'} mt-1" style="opacity: 0.8; color: ${textColor} !important;">
                                        ${date} ${time}
                                    </small>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                $("#messagesContainer").html(`
                    <div class="messages-wrapper d-flex flex-column">
                        ${messagesHtml}
                    </div>
                `);

                const messagesContainer = document.getElementById("messagesContainer");
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                $("#messageInputContainer").removeClass("d-none");
                this.markCustomerMessagesAsRead(conversationId);
                setTimeout(this.scrollToBottom, 100);
            })
            .catch(error => {
                console.error("Failed to load customer conversation:", error);
                $("#messagesContainer").html(`
                    <div class="alert alert-danger m-3">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Failed to load messages. Please try again.
                    </div>
                `);
            });
    },

    loadConversation: function(conversationId) {
        const activeContact = $(".conversation-item.active");
        if (activeContact.length > 0) {
            const contactName = activeContact.find("h6").text().trim().replace(/New$/, '');
            $("#conversationTitle").text(contactName);
        }

        $("#messagesContainer").html(`
            <div class="text-center p-3">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading messages...</p>
            </div>
        `);

        API.getConversationMessages(conversationId)
            .then(data => {
                $("#sendMessageForm").data("conversation-id", conversationId);
                const messages = data.data || [];

                if (messages.length === 0) {
                    $("#messagesContainer").html(`
                        <div class="text-center p-5">
                            <p class="text-muted">No messages yet</p>
                            <p class="text-muted small">Start the conversation by sending a message below</p>
                        </div>
                    `);
                } else {
                    const currentUserId = parseInt(localStorage.getItem("userId") || "0");

                    const messagesHtml = messages.map(message => {
                        const isCurrentUser = message.sender_id === currentUserId;
                        console.log(isCurrentUser);
                        console.log(currentUserId);
                        const alignClass = isCurrentUser ? 'justify-content-end' : 'justify-content-start';
                        const bgColor = isCurrentUser ? '#007bff' : '#f1f1f1';
                        const textColor = isCurrentUser ? '#fff' : '#000';

                        const time = message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                        const date = message.created_at ? formatDate(message.created_at) : '';

                        return `
                            <div class="d-flex ${alignClass} mb-3">
                                <div class="message-bubble" style="background: ${bgColor}; color: ${textColor}; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                                    <div class="message-content">
                                        <p class="mb-0">${message.message}</p>
                                        <small class="d-block text-${isCurrentUser ? 'end' : 'start'} mt-1" style="opacity: 0.8; color: ${textColor} !important;">
                                            ${date} ${time}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');

                    $("#messagesContainer").html(`
                        <div class="messages-wrapper d-flex flex-column">
                            ${messagesHtml}
                        </div>
                    `);

                    setTimeout(this.scrollToBottom, 100);
                }

                $("#messageInputContainer").removeClass("d-none");
                this.markMessagesAsRead(conversationId);
            })
            .catch(error => {
                console.error("Failed to load conversation:", error);
                $("#messagesContainer").html(`
                    <div class="alert alert-danger m-3">
                        Failed to load messages. Please try again.
                    </div>
                `);
            });
    },

    openNewMessageModal: function() {
        $("#newMessageForm")[0].reset();
        $("#messageRecipient").html(`<option value="">Loading photographers...</option>`);

        API.getPhotographers()
            .then(data => {
                if (!data.data || data.data.length === 0) {
                    $("#messageRecipient").html(`<option value="">No photographers available</option>`);
                    return;
                }

                const options = data.data.map(photographer =>
                    `<option value="${photographer.id}">${photographer.name}</option>`
                ).join('');

                $("#messageRecipient").html(`
                    <option value="">Select a photographer</option>
                    ${options}
                `);
            })
            .catch(error => {
                console.error("Failed to load photographers:", error);
                $("#messageRecipient").html(`<option value="">Error loading photographers</option>`);
            });

        const newMessageModal = new bootstrap.Modal(document.getElementById('newMessageModal'));
        newMessageModal.show();
    },

    sendMessage: function() {
        const conversationId = $("#sendMessageForm").data("conversation-id");
        const conversationType = $("#sendMessageForm").data("conversation-type") || 'photographer';
        const message = $("#messageInput").val().trim();

        if (!conversationId) {
            showNotification("Conversation not selected", "warning");
            return;
        }

        if (!message) {
            return;
        }

        $("#messageInput").prop("disabled", true);

        const currentTime = new Date().toISOString();
        const formattedTime = formatTime(currentTime);
        const formattedDate = formatDate(currentTime);

        const newMessageHtml = `
            <div class="d-flex justify-content-end mb-3">
                <div class="message-bubble" style="background: #007bff; color: #fff; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                    <div class="message-content">
                        <p class="mb-0">${message}</p>
                        <small class="d-block text-end mt-1" style="opacity: 0.8; color: #fff !important;">
                            ${formattedDate} ${formattedTime}
                        </small>
                    </div>
                </div>
            </div>
        `;

        $(".messages-wrapper").append(newMessageHtml);

        this.scrollToBottom();

        if (conversationType === 'customer') {
            API.sendCustomerMessage({
                conversation_id: conversationId,
                message: message
            })
                .then(response => {
                    $("#messageInput").val("").prop("disabled", false).focus();
                })
                .catch(error => {
                    console.error("Failed to send message:", error);
                    $("#messageInput").prop("disabled", false);
                    showNotification("Failed to send message. Please try again.", "error");
                });
        } else {
            const conversation = window.conversationsData.find(c => c.id == conversationId && c.type === 'photographer');

            if (!conversation || !conversation.photographer || !conversation.photographer.id) {
                showNotification("Invalid conversation data", "error");
                $("#messageInput").prop("disabled", false);
                return;
            }

            const messageData = {
                photographer_id: conversation.photographer.id,
                message: message
            };

            API.sendMessage(messageData)
                .then(response => {
                    $("#messageInput").val("").prop("disabled", false).focus();
                })
                .catch(error => {
                    console.error("Failed to send message:", error);
                    $("#messageInput").prop("disabled", false);
                    showNotification("Failed to send message. Please try again.", "error");
                });
        }
    },

    scrollToBottom: function() {
        const messagesContainer = document.getElementById("messagesContainer");
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        const messagesWrapper = document.querySelector(".messages-wrapper");
        if (messagesWrapper) {
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
        }
    },

    createOrOpenConversation: function(photographerId) {
        if (!photographerId) {
            showNotification("Invalid photographer ID", "error");
            return;
        }

        $(".nav-link").removeClass("active");
        $('[data-section="messages"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#messagesSection").removeClass("d-none");

        API.getConversations()
            .then(conversations => {
                const conversationList = Array.isArray(conversations) ? conversations : [];

                const existingConversation = conversationList.find(conv => {
                    return conv.photographer && conv.photographer.id == photographerId;
                });

                if (existingConversation) {
                    setTimeout(() => {
                        $(".conversation-item[data-id='" + existingConversation.id + "']").click();
                    }, 500);
                    return;
                }
                $("#messageRecipient").val(photographerId);
                $("#messageSubject").val(`Regarding photography services`);
                this.openNewMessageModal();
            })
            .catch(error => {
                console.error("Failed to check conversations:", error);
                showNotification("Failed to open conversation. Please try again.", "error");

                $("#messageRecipient").val(photographerId);
                $("#messageSubject").val(`Regarding photography services`);
                this.openNewMessageModal();
            });
    },

    markMessagesAsRead: function(conversationId) {
        API.markMessagesAsRead(conversationId)
            .then(() => {
                $(`.conversation-item[data-id="${conversationId}"]`).removeClass("fw-bold")
                    .find(".badge").remove();
                CustomerDashboardData.loadDashboardCounts();
            })
            .catch(error => {
                console.error("Failed to mark messages as read:", error);
            });
    },

    markCustomerMessagesAsRead: function(conversationId) {
        API.markCustomerMessagesAsRead(conversationId)
            .then(() => {
                $(`.conversation-item[data-id="${conversationId}"]`).removeClass("fw-bold")
                    .find(".badge").remove();
                CustomerDashboardData.loadDashboardCounts();
            })
            .catch(error => {
                console.error("Failed to mark customer messages as read:", error);
            });
    },

    sendNewMessage: function() {
        const photographerId = $("#messageRecipient").val();
        const subject = $("#messageSubject").val();
        const message = $("#messageContent").val();

        if (!photographerId) {
            showNotification("Please select photographer", "warning");
            return;
        }

        if (!subject.trim()) {
            showNotification("Please type subject", "warning");
            return;
        }

        if (!message.trim()) {
            showNotification("Please type message", "warning");
            return;
        }

        const messageData = {
            photographer_id: photographerId,
            subject: subject,
            message: message
        };

        $("#sendNewMessageBtn").prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');

        API.sendMessage(messageData)
            .then(response => {
                showNotification("Message sent successfully", "success");
                $("#newMessageForm")[0].reset();
                const newMessageModal = bootstrap.Modal.getInstance(document.getElementById('newMessageModal'));
                newMessageModal.hide();
                this.loadMessages();
            })
            .catch(error => {
                console.error(error);
                showNotification("Failed to send message", "error");
            })
            .finally(() => {
                $("#sendNewMessageBtn").prop("disabled", false).html('Send Message');
            });
    }
};
