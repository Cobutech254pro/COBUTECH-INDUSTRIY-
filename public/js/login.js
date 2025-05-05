document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginErrorMessage = document.getElementById('login-error-message');
    const resendVerificationLink = document.getElementById('resend-verification-link');
    const resendVerificationButton = document.getElementById('resend-verification-button');
    const emailInput = document.getElementById('email');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        loginErrorMessage.classList.add('hidden'); // Hide any previous error messages
        loginErrorMessage.textContent = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful, store token (example), and redirect
                console.log('Login successful:', data);
                localStorage.setItem('authToken', data.token);
                window.location.href = '/dashboard'; // Redirect to your dashboard page
            } else if (response.status === 401) {
                // Invalid credentials
                loginErrorMessage.textContent = data.error || 'Invalid email or password.';
                loginErrorMessage.classList.remove('hidden');
                resendVerificationLink.classList.add('hidden');
            } else if (response.status === 403) {
                // Email not verified
                loginErrorMessage.textContent = data.error || 'Email not verified. Please check your email.';
                loginErrorMessage.classList.remove('hidden');
                resendVerificationLink.classList.remove('hidden');
            } else {
                // Other login error
                loginErrorMessage.textContent = data.error || 'Login failed. Please try again later.';
                loginErrorMessage.classList.remove('hidden');
                resendVerificationLink.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error during login:', error);
            loginErrorMessage.textContent = 'Login failed due to a network error.';
            loginErrorMessage.classList.remove('hidden');
            resendVerificationLink.classList.add('hidden');
        }
    });

    resendVerificationButton.addEventListener('click', async () => {
        const email = emailInput.value;

        if (!email) {
            loginErrorMessage.textContent = 'Please enter your email to resend verification.';
            loginErrorMessage.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.message?.includes('sent')) {
                loginErrorMessage.textContent = 'Verification email resent. Please check your inbox.';
                loginErrorMessage.classList.remove('hidden');
                resendVerificationLink.classList.add('hidden'); // Optionally hide the resend link temporarily
            } else {
                loginErrorMessage.textContent = data.error || 'Failed to resend verification email.';
                loginErrorMessage.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error resending verification email:', error);
            loginErrorMessage.textContent = 'Failed to resend verification email due to a network error.';
            loginErrorMessage.classList.remove('hidden');
        }
    });
});
                                              
