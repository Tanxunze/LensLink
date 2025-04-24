$(document).ready(function () {
    // Check if user is already logged in
    if (localStorage.getItem("token")) {
        const userRole = localStorage.getItem("userRole");
        const redirectPath = userRole === "photographer"
            ? "../dashboard/photographer.html"
            : "../dashboard/customer.html";
        window.location.href = redirectPath;
        return;
    }

    
    $("#name").on('blur', function() {
        validateName();
    });

    $("#email").on('blur', function() {
        validateEmail();
    });

    $("#password").on('input', function() {
        validatePasswordStrength();
    });

    $("#confirmPassword").on('input', function() {
        validatePasswordMatch();
    });

    
    $("#registerForm").submit(function(event) {
        event.preventDefault();

        
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePasswordStrength() >= 3;
        const isPasswordMatch = validatePasswordMatch();

        
        if (isNameValid && isEmailValid && isPasswordValid && isPasswordMatch) {
            handleRegister();
        } else {
            
            $("#registerError")
                .text("Please correct the errors in the form before submitting.")
                .removeClass("d-none");

            
            if (!isNameValid) $("#name").focus();
            else if (!isEmailValid) $("#email").focus();
            else if (!isPasswordValid) $("#password").focus();
            else $("#confirmPassword").focus();
        }
    });
});

function validateForm() {
    $("#registerError").addClass("d-none");

    // Validate name
    if (!validateName()) return false;

    // Validate email
    if (!validateEmail()) return false;

    // Validate password strength
    const password = $("#password").val();
    const strength = getPasswordStrength(password);

    if (strength < 3) {
        $("#registerError")
            .text("Password is too weak. Please use a stronger password.")
            .removeClass("d-none");
        return false;
    }

    // Validate password match
    const confirmPassword = $("#confirmPassword").val();
    if (password !== confirmPassword) {
        $("#registerError")
            .text("Passwords do not match.")
            .removeClass("d-none");
        return false;
    }

    return true;
}

function validateName() {
    const name = $("#name").val().trim();
    const feedbackElement = $("#nameFeedback");

    $("#name").removeClass("is-invalid is-valid");

    if (!name) {
        $("#name").addClass("is-invalid");
        feedbackElement.text('Name is required').removeClass('text-success d-none').addClass('text-danger d-block');
        return false;
    }

    if (name.length < 2) {
        $("#name").addClass("is-invalid");
        feedbackElement.text('Name must be at least 2 characters').removeClass('text-success d-none').addClass('text-danger d-block');
        return false;
    }

    $("#name").addClass("is-valid");
    feedbackElement.text('Name is valid').removeClass('text-danger d-none').addClass('text-success d-block');
    return true;
}

function validateEmail() {
    const email = $("#email").val().trim();
    const feedbackElement = $("#emailFeedback");
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    $("#email").removeClass("is-invalid is-valid");

    if (!email) {
        $("#email").addClass("is-invalid");
        feedbackElement.text('Email is required').removeClass('text-success d-none').addClass('text-danger d-block');
        return false;
    }

    if (!emailRegex.test(email)) {
        $("#email").addClass("is-invalid");
        feedbackElement.text('Please enter a valid email address (example: name@example.com)').removeClass('text-success d-none').addClass('text-danger d-block');
        return false;
    }

    $("#email").addClass("is-valid");
    feedbackElement.text('Email is valid').removeClass('text-danger d-none').addClass('text-success d-block');
    return true;
}

function getPasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;
    const regexes = [
        /[a-z]/,
        /[A-Z]/,
        /[0-9]/,
        /[^a-zA-Z0-9]/
    ];

    regexes.forEach(regex => {
        if (regex.test(password)) strength++;
    });

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    return strength;
}

function validatePasswordStrength() {
    const password = $("#password").val();
    const strengthMeter = $("#passwordStrength");
    const requirementsElement = $("#passwordRequirements");

    if (!password) {
        strengthMeter.addClass('d-none');
        requirementsElement.removeClass('text-success text-danger text-warning').addClass('text-muted');
        return 0;
    }

    strengthMeter.removeClass('d-none');

    const strength = getPasswordStrength(password);

    const percentage = (strength / 6) * 100;
    strengthMeter.css('width', percentage + '%');

    if (percentage < 40) {
        strengthMeter.removeClass('bg-warning bg-success').addClass('bg-danger');
        requirementsElement.removeClass('text-muted text-success text-warning').addClass('text-danger');
    } else if (percentage < 70) {
        strengthMeter.removeClass('bg-danger bg-success').addClass('bg-warning');
        requirementsElement.removeClass('text-muted text-danger text-success').addClass('text-warning');
    } else {
        strengthMeter.removeClass('bg-danger bg-warning').addClass('bg-success');
        requirementsElement.removeClass('text-muted text-danger text-warning').addClass('text-success');
    }

    let requirementText = "Password requirements: ";
    const missing = [];

    if (!/[a-z]/.test(password)) missing.push("lowercase letter");
    if (!/[A-Z]/.test(password)) missing.push("uppercase letter");
    if (!/[0-9]/.test(password)) missing.push("number");
    if (!/[^a-zA-Z0-9]/.test(password)) missing.push("special character");
    if (password.length < 8) missing.push("minimum 8 characters");

    if (missing.length > 0) {
        requirementText += "Missing " + missing.join(", ");
        requirementsElement.text(requirementText);
    } else {
        requirementsElement.text("Password strength: " +
            (percentage < 40 ? "Weak" : percentage < 70 ? "Medium" : "Strong"));
    }

    return strength;
}

function validatePasswordMatch() {
    const password = $("#password").val();
    const confirmPassword = $("#confirmPassword").val();
    const feedbackElement = $("#passwordMatchFeedback");

    $("#confirmPassword").removeClass("is-invalid is-valid");

    if (!confirmPassword) {
        feedbackElement.addClass('d-none');
        return false;
    }

    feedbackElement.removeClass('d-none');

    if (password === confirmPassword) {
        $("#confirmPassword").addClass("is-valid");
        feedbackElement.text('Passwords match').removeClass('text-danger').addClass('text-success');
        return true;
    } else {
        $("#confirmPassword").addClass("is-invalid");
        feedbackElement.text('Passwords do not match').removeClass('text-success').addClass('text-danger');
        return false;
    }
}

function handleRegister() {
    
    $("#registerError").addClass("d-none");
    resetFieldErrors();

    const submitButton = $("#registerForm button[type='submit']");
    const originalText = submitButton.text();
    submitButton.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...');
    submitButton.prop('disabled', true);

    const userData = {
        name: $("#name").val().trim(),
        email: $("#email").val().trim(),
        password: $("#password").val(),
        role: $("input[name='role']:checked").val()
    };

    API.register(userData)
        .then(function (response) {
            if (response.success) {
                $("#registerSuccess")
                    .text("Registration successful! Logging you in...")
                    .removeClass("d-none");

                return API.login({
                    email: userData.email,
                    password: userData.password
                });
            }
        })
        .then(function (loginResponse) {
            if (loginResponse && loginResponse.token) {
                localStorage.setItem("token", loginResponse.token);
                localStorage.setItem("userRole", userData.role);

                const redirectPath = userData.role === "photographer"
                    ? "../dashboard/photographer.html"
                    : "../dashboard/customer.html";
                window.location.href = redirectPath;
            }
        })
        .catch(function (error) {
            const errorData = error.responseJSON || error;

            
            if (errorData.errors) {
                let hasFieldErrors = false;

                
                for (const field in errorData.errors) {
                    const errorMessages = errorData.errors[field];
                    if (errorMessages && errorMessages.length > 0) {
                        displayFieldError(field, errorMessages[0]);
                        hasFieldErrors = true;
                    }
                }

                
                if (hasFieldErrors) {
                    return;
                }
            }

            
            let errorMessage = 'Registration failed. Please try again.';

            
            if (errorData.message && errorData.message.includes('email')) {
                if (errorData.message.includes('unique') || errorData.message.includes('already')) {
                    displayFieldError('email', 'This email is already registered. Please use another email or login.');
                    return;
                }
            }

            
            if (errorData.message) {
                errorMessage = errorData.message;
            }

            $("#registerError")
                .html(errorMessage)
                .removeClass("d-none");

            console.error(error);
        })
        .finally(function () {
            submitButton.html(originalText);
            submitButton.prop('disabled', false);
        });
}


function resetFieldErrors() {
    $("#nameFeedback, #emailFeedback, #passwordMatchFeedback").addClass('d-none');
    $("#name, #email, #password, #confirmPassword").removeClass('is-invalid');
}


function displayFieldError(field, message) {
    
    const fieldMap = {
        'name': 'name',
        'email': 'email',
        'password': 'password'
    };

    const elementId = fieldMap[field];
    if (!elementId) return;

    const inputElement = $(`#${elementId}`);
    const feedbackElement = $(`#${elementId}Feedback`);

    
    inputElement.addClass('is-invalid');

    
    feedbackElement
        .text(message)
        .removeClass('text-success')
        .addClass('text-danger d-block');

    
    if ($('.is-invalid').length === 1) {
        inputElement.focus();
    }
}