const PhotographerMessages = {
    init: function() {
        
    },

    messageClient: function(clientId) {
        $(".nav-link").removeClass("active");
        $('[data-section="messages"]').addClass("active");
        $(".dashboard-section").addClass("d-none");
        $("#messagesSection").removeClass("d-none");

        this.loadMessages(clientId);
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


        API.getConversations()
            .then(conversations => {
                window.conversationsData = conversations || [];

                const conversationsHtml = conversations.map(conversation => {

                    let otherPartyName, otherPartyImage, unreadCount;

                    if (conversation.customer) {
                        otherPartyName = conversation.customer.name || 'Client';
                        otherPartyImage = conversation.customer.profile_image || '../../assets/images/default-avatar.jpg';
                    } else if (conversation.sender) {
                        otherPartyName = conversation.sender.name || 'Client';
                        otherPartyImage = conversation.sender.profile_image || '../../assets/images/default-avatar.jpg';
                    } else {
                        otherPartyName = 'Client';
                        otherPartyImage = '../../assets/images/default-avatar.jpg';
                    }

                    unreadCount = conversation.unread_count || 0;

                    let lastMessageTime = formatDate(conversation.last_message_time || conversation.created_at);
                    let lastMessageText = conversation.last_message || 'No messages yet';

                    const unreadClass = unreadCount > 0 ? 'fw-bold' : '';
                    const unreadBadge = unreadCount > 0
                        ? `<span class="badge bg-danger rounded-pill ms-2">${unreadCount}</span>`
                        : '';

                    return `
                    <a href="#" class="list-group-item list-group-item-action conversation-item ${unreadClass}" 
                       data-id="${conversation.id}"
                       data-other-name="${otherPartyName}">
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img src="${otherPartyImage}" class="rounded-circle me-2" width="32" height="32" alt="${otherPartyName}">
                                <h6 class="mb-1">${otherPartyName} ${unreadBadge}</h6>
                            </div>
                            <small class="text-muted">${lastMessageTime}</small>
                        </div>
                        <p class="mb-1 text-truncate ps-4">${lastMessageText}</p>
                    </a>
                    `;
                }).join('');

                $("#conversationsList").html(conversationsHtml);

                $(".conversation-item").click(function(e) {
                    e.preventDefault();
                    const conversationId = $(this).data("id");
                    const otherName = $(this).data("other-name");

                    if (!conversationId) {
                        console.error("Missing conversation ID");
                        return;
                    }

                    $("#sendMessageForm").data("conversation-id", conversationId);
                    $("#conversationTitle").text(otherName);

                    $(this).removeClass("fw-bold")
                        .find(".badge").remove();

                    $(".conversation-item").removeClass("active");
                    $(this).addClass("active");

                    $("#conversationMenu").removeClass("d-none");

                    PhotographerMessages.loadConversationMessages(conversationId);
                    API.markMessagesAsRead(conversationId);
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

    loadConversationMessages: function(conversationId) {
        $("#messagesContainer").html(`
            <div class="text-center p-3">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading messages...</p>
            </div>
        `);


        API.getUserProfile()
            .then(userData => {
                const currentUserId = userData.id;


                return API.getConversationMessages(conversationId)
                    .then(response => {
                        const messages = response.data || [];

                        if (messages.length === 0) {
                            $("#messagesContainer").html(`
                                <div class="text-center p-5">
                                    <i class="bi bi-chat-dots display-4 text-muted"></i>
                                    <p class="mt-3">No messages in this conversation</p>
                                </div>
                            `);
                            return;
                        }

                        const messagesHtml = messages.map(msg => {

                            const isCurrentUser = parseInt(msg.sender_id) === parseInt(currentUserId);
                            const alignClass = isCurrentUser ? 'justify-content-end' : 'justify-content-start';
                            const bgColor = isCurrentUser ? '#007bff' : '#f1f1f1';
                            const textColor = isCurrentUser ? '#fff' : '#000';

                            const time = this.formatTime(msg.created_at);
                            const date = formatDate(msg.created_at);

                            return `
                                <div class="d-flex ${alignClass} mb-3">
                                    <div class="message-bubble" style="background: ${bgColor}; color: ${textColor}; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                                        <div class="message-content">
                                            <p class="mb-0">${msg.message}</p>
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

                        $("#messageInputContainer").removeClass("d-none");


                        setTimeout(this.scrollToBottom, 100);
                    });
            })
            .catch(error => {
                console.error("Failed to load conversation messages:", error);
                $("#messagesContainer").html(`
                    <div class="alert alert-danger">
                        Failed to load messages. Please try again.
                    </div>
                `);
            });
    },

    formatTime: function(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    displayConversationMessages: function(conversation, user_id) {
        if (!conversation || !conversation.messages || conversation.messages.length === 0) {
            $("#messagesContainer").html(`
                <div class="text-center p-5">
                    <i class="bi bi-chat-dots display-4 text-muted"></i>
                    <p class="mt-3">No messages in this conversation</p>
                </div>
            `);
            return;
        }

        const photographerId = user_id;
        console.log(photographerId);

        const messagesHtml = conversation.messages.map(msg => {
            const isOwn = msg.sender_id === photographerId;

            return `
                <div class="d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'} mb-3">
                    <div class="message-bubble ${isOwn ? 'message-own' : 'message-other'}" style="background: ${isOwn ? '#007bff' : '#f1f1f1'}; color: ${isOwn ? '#fff' : '#000'};">
                        <div class="message-content">
                            <p class="mb-0">${msg.message}</p>
                            <small class="text-muted d-block text-${isOwn ? 'end' : 'start'} mt-1" style="color: ${isOwn ? '#fff' : '#000'} !important;">
                                ${formatDate(msg.created_at)}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $("#messagesContainer").html(`
            <div class="messages-wrapper">
                ${messagesHtml}
            </div>
        `);

        const messageWrapper = document.querySelector("#messages-wrapper");
        if (messageWrapper) {
            messageWrapper.scrollTop = messageWrapper.scrollHeight;
        }
    },

    sendMessage: function(conversationId, messageText) {
        const sendButton = $("#sendMessageForm button[type='submit']");
        sendButton.prop("disabled", true);


        $("#messageInput").val("");


        const currentTime = new Date();
        const formattedTime = this.formatTime(currentTime);
        const formattedDate = formatDate(currentTime);


        const tempId = 'msg_' + Date.now();


        const newMessageHtml = `
            <div class="d-flex justify-content-end mb-3" id="${tempId}">
                <div class="message-bubble" style="background: #007bff; color: #fff; border-radius: 1rem; padding: 0.75rem; max-width: 75%;">
                    <div class="message-content">
                        <p class="mb-0">${messageText}</p>
                        <small class="d-block text-end mt-1" style="opacity: 0.8; color: #fff !important;">
                            ${formattedDate} ${formattedTime}
                            <span class="message-status"><i class="bi bi-clock"></i></span>
                        </small>
                    </div>
                </div>
            </div>
        `;


        if ($(".messages-wrapper").length === 0) {
            $("#messagesContainer").html('<div class="messages-wrapper d-flex flex-column"></div>');
        }


        $(".messages-wrapper").append(newMessageHtml);


        this.scrollToBottom();


        API.replyToConversation({
            conversation_id: conversationId,
            message: messageText
        })
            .then(response => {
                console.log("Message sent successfully:", response);


                $(`#${tempId} .message-status`).html('<i class="bi bi-check-all"></i>');



                this.updateConversationPreview(conversationId, messageText);
            })
            .catch(error => {
                console.error("Failed to send message:", error);


                $(`#${tempId} .message-status`).html('<i class="bi bi-exclamation-triangle text-danger"></i>');

                showNotification("Failed to send message. Please try again.", "error");
            })
            .finally(() => {
                sendButton.prop("disabled", false);
                $("#messageInput").focus();
            });
    },

    updateConversationPreview: function(conversationId, lastMessage) {
        const conversationItem = $(`.conversation-item[data-id="${conversationId}"]`);
        if (conversationItem.length) {

            conversationItem.find("p.mb-1").text(lastMessage);


            const now = new Date();
            conversationItem.find("small.text-muted").text(formatDate(now));


            const conversationsList = $("#conversationsList");
            conversationsList.prepend(conversationItem);
        }
    }
};