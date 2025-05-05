document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const loginErrorMessage = document.getElementById('login-error-message');
    const resendVerificationLink = document.getElementById('resend-verification-link');
    const resendVerificationButton = document.getElementById('resend-verification-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const togglePasswordButton = document.getElementById('toggle-password');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    // Load "Remember Me" state
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
        emailInput.value = storedEmail;
        rememberCheckbox.checked = true;
    }

    // Password Visibility Toggle
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const eyeIcon = togglePasswordButton.querySelector('i');
        if (type === 'password') {
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
            togglePasswordButton.setAttribute('aria-pressed', 'false');
            togglePasswordButton.setAttribute('aria-label', 'Show password');
        } else {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
            togglePasswordButton.setAttribute('aria-pressed', 'true');
            togglePasswordButton.setAttribute('aria-label', 'Hide password');
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        let isValid = true;

        // Input Validation
        emailError.classList.add('hidden');
        passwordError.classList.add('hidden');

        if (!email) {
            emailError.textContent = 'Please enter your email.';
            emailError.classList.remove('hidden');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.classList.remove('hidden');
            isValid = false;
        }

        if (!password) {
            passwordError.textContent = 'Please enter your password.';
            passwordError.classList.remove('hidden');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Visual Feedback - Loading Spinner
        loginButton.disabled = true;
        loadingSpinner.classList.remove('hidden');
        loginErrorMessage.classList.add('hidden');
        loginErrorMessage.textContent = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            // Remember Me
            if (rememberCheckbox.checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            if (response.ok) {
                console.log('Login successful:', data);
                localStorage.setItem('authToken', data.token);
                window.location.href = '/user-accounts.html';
            } else if (response.status === 401) {
                loginErrorMessage.textContent = data.error || 'Invalid email or password.';
                loginErrorMessage.classList.remove('hidden');
                resendVerificationLink.classList.add('hidden');
            } else if (response.status === 403) {
                loginErrorMessage.textContent = data.error || 'Email not verified. Please check your email.';
                loginErrorMessage.classList.remove('hidden');
                resendVerificationLink.classList.remove('hidden');
            } else {
                loginErrorMessage.textContent = data.error || 'Login failed. Please try again later.';
                loginErrorMessage.classList.remove('hidden');
                resendVerificationLink.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error during login:', error);
            loginErrorMessage.textContent = 'Login failed due to a network error.';
            loginErrorMessage.classList.remove('hidden');
            resendVerificationLink.classList.add('hidden');
        } finally {
            loginButton.disabled = false;
            loadingSpinner.classList.add('hidden');
        }
    });

    resendVerificationButton.addEventListener('click', async () => {
        // ... (resend verification email logic - remains the same) ...
    });
});
