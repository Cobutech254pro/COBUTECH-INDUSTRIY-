document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const requestResetButton = document.getElementById('request-reset-button');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const forgotPasswordMessage = document.getElementById('forgot-password-message');
    const forgotPasswordErrorMessage = document.getElementById('forgot-password-error-message');
    const loadingSpinner = document.querySelector('.loading-spinner');

    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        let isValid = true;

        // Input Validation
        emailError.classList.add('hidden');
        forgotPasswordMessage.classList.add('hidden');
        forgotPasswordErrorMessage.classList.add('hidden');

        if (!email) {
            emailError.textContent = 'Please enter your email address.';
            emailError.classList.remove('hidden');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.classList.remove('hidden');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Visual Feedback - Loading Spinner
        requestResetButton.disabled = true;
        loadingSpinner.classList.remove('hidden');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                forgotPasswordMessage.textContent = data.message || 'A password reset link has been sent to your email address.';
                forgotPasswordMessage.classList.remove('hidden');
                forgotPasswordForm.reset(); // Clear the form
            } else {
                forgotPasswordErrorMessage.textContent = data.error || 'Failed to send password reset email. Please try again.';
                forgotPasswordErrorMessage.classList.
