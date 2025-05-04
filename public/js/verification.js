import { initializeApp } from 'firebase/app';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyCmk6NU1uiCnb6syjOmgTjpq5qBP5QyQAY",
    authDomain: "cobu-tech-portal.firebaseapp.com",
    projectId: "cobu-tech-portal",
    storageBucket: "cobu-tech-portal.firebasestorage.app",
    messagingSenderId: "61919067593",
    appId: "1:61919067593:web:5a60042df8622d6edb3c18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
    const requestCodeSection = document.getElementById('request-code-section');
    const verifyCodeSection = document.getElementById('verify-code-section');
    const requestCodeButton = document.getElementById('request-code-button');
    const verifyCodeButton = document.getElementById('verify-code-button');
    const verificationCodeInput = document.getElementById('verification-code');
    const verificationSuccessDiv = document.getElementById('verification-success');
    const verificationErrorDiv = document.getElementById('verification-error');
    const requestCodeMessage = document.getElementById('request-code-message');
    const verifyCodeMessage = document.getElementById('verify-code-message');
    const proceedQuotationButton = document.getElementById('proceed-quotation-button');
    const codeExpirationTimer = document.getElementById('code-expiration-timer');
    const newCodeCooldownTimer = document.getElementById('new-code-cooldown-timer');

    let expirationInterval;
    let cooldownInterval;
    let canRequestNewCode = true;
    let cooldownTimeRemaining = 0;

    // Initially show the request code section
    requestCodeSection.classList.remove('hidden');
    verifyCodeSection.classList.add('hidden');
    verificationSuccessDiv.classList.add('hidden');
    verificationErrorDiv.classList.add('hidden');
    codeExpirationTimer.classList.add('hidden');
    newCodeCooldownTimer.classList.add('hidden');

    function startExpirationTimer(duration) {
        clearInterval(expirationInterval);
        codeExpirationTimer.classList.remove('hidden');
        let timeLeft = duration;
        codeExpirationTimer.textContent = `Code expires in ${timeLeft} seconds`;
        expirationInterval = setInterval(() => {
            timeLeft--;
            codeExpirationTimer.textContent = `Code expires in ${timeLeft} seconds`;
            if (timeLeft <= 0) {
                clearInterval(expirationInterval);
                codeExpirationTimer.classList.add('hidden');
                verifyCodeMessage.textContent = 'Verification code expired. Request a new one.';
                startCooldownTimer(120);
            }
        }, 1000);
    }

    function startCooldownTimer(duration) {
        canRequestNewCode = false;
        cooldownTimeRemaining = duration;
        newCodeCooldownTimer.classList.remove('hidden');
        requestCodeButton.disabled = true;
        newCodeCooldownTimer.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
        clearInterval(cooldownInterval);
        cooldownInterval = setInterval(() => {
            cooldownTimeRemaining--;
            newCodeCooldownTimer.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
            if (cooldownTimeRemaining <= 0) {
                clearInterval(cooldownInterval);
                newCodeCooldownTimer.classList.add('hidden');
                requestCodeButton.disabled = false;
                canRequestNewCode = true;
            }
        }, 1000);
    }

    requestCodeButton.addEventListener('click', async () => {
        if (!canRequestNewCode) {
            return; // Prevent multiple requests during cooldown
        }
        requestCodeMessage.textContent = 'Sending verification code...';
        try {
            const response = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // You might need to send the user's email or UID here if your backend needs it
                // body: JSON.stringify({ email: /* user's email */ }),
            });
            const data = await response.json();
            if (response.ok && data.message === 'Verification code sent') {
                requestCodeSection.classList.add('hidden');
                verifyCodeSection.classList.remove('hidden');
                requestCodeMessage.textContent = '';
                startExpirationTimer(60); // Start the 60-second timer
            } else {
                requestCodeMessage.textContent = data.error || 'Failed to send verification code.';
                startCooldownTimer(120); // Start cooldown on failure as well
            }
        } catch (error) {
            console.error('Error sending verification code:', error);
            requestCodeMessage.textContent = 'Failed to send verification code.';
            startCooldownTimer(120); // Start cooldown on error as well
        }
    });

    verifyCodeButton.addEventListener('click', async () => {
        const code = verificationCodeInput.value.trim();
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            verifyCodeMessage.textContent = 'Please enter a valid 6-digit code.';
            return;
        }

        verifyCodeMessage.textContent = 'Verifying code...';
        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code }),
            });
            const data = await response.json();
            if (response.ok && data.message === 'Email verified') {
                clearInterval(expirationInterval); // Clear the expiration timer
                verifyCodeSection.classList.add('hidden');
                verificationSuccessDiv.classList.remove('hidden');
                verifyCodeMessage.textContent = '';
                // Optionally store verification status on the client-side (e.g., localStorage)
            } else {
                verificationErrorDiv.classList.remove('hidden');
                verificationErrorDiv.textContent = data.error || 'Verification failed. Please try again.';
                verifyCodeMessage.textContent = '';
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            verificationErrorDiv.classList.remove('hidden');
            verificationErrorDiv.textContent = 'Verification failed. Please try again.';
            verifyCodeMessage.textContent = '';
        }
    });

    if (proceedQuotationButton) {
        proceedQuotationButton.addEventListener('click', () => {
            window.location.href = '/prompt-quotation'; // Redirect to the quotation page
        });
    }
});
