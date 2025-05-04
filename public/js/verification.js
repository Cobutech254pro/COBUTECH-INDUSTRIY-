import { initializeApp } from 'firebase/app';

// Firebase configuration
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
    const codeInputs = document.querySelectorAll('.code-input');
    const verificationSuccessDiv = document.getElementById('verification-success');
    const verificationErrorDiv = document.getElementById('verification-error');
    const requestCodeMessage = document.getElementById('request-code-message');
    const verifyCodeMessage = document.getElementById('verify-code-message');
    const proceedQuotationButton = document.getElementById('proceed-quotation-button');
    const codeExpirationTimerDisplay = document.getElementById('code-expiration-timer');
    const newCodeCooldownTimerDisplay = document.getElementById('new-code-cooldown-timer');
    const requestNewCodeButton = document.getElementById('request-new-code-button');

    let expirationInterval;
    let canRequestNewCode = true;
    let cooldownTimeRemaining = 0;

    // Initial state: Show request code section
    requestCodeSection.classList.remove('hidden');
    verifyCodeSection.classList.add('hidden');
    verificationSuccessDiv.classList.add('hidden');
    verificationErrorDiv.classList.add('hidden');
    codeExpirationTimerDisplay.classList.add('hidden');
    newCodeCooldownTimerDisplay.classList.add('hidden');
    if (requestNewCodeButton) requestNewCodeButton.classList.add('hidden');

    function startExpirationTimer(duration) {
        clearInterval(expirationInterval);
        codeExpirationTimerDisplay.classList.remove('hidden');
        let timeLeft = duration;
        codeExpirationTimerDisplay.textContent = `Code expires in ${timeLeft} seconds`;
        expirationInterval = setInterval(() => {
            timeLeft--;
            codeExpirationTimerDisplay.textContent = `Code expires in ${timeLeft} seconds`;
            if (timeLeft <= 0) {
                clearInterval(expirationInterval);
                codeExpirationTimerDisplay.classList.add('hidden');
                verifyCodeMessage.textContent = 'Verification code expired. Request a new one.';
                // Optionally, show the request new code button here
                if (requestNewCodeButton) requestNewCodeButton.classList.remove('hidden');
            }
        }, 1000);
    }

    function startCooldownTimer(duration) {
        canRequestNewCode = false;
        cooldownTimeRemaining = duration;
        newCodeCooldownTimerDisplay.classList.remove('hidden');
        requestCodeButton.disabled = true;
        newCodeCooldownTimerDisplay.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
        clearInterval(cooldownInterval);
        const cooldownInterval = setInterval(() => {
            cooldownTimeRemaining--;
            newCodeCooldownTimerDisplay.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
            if (cooldownTimeRemaining <= 0) {
                clearInterval(cooldownInterval);
                newCodeCooldownTimerDisplay.classList.add('hidden');
                requestCodeButton.disabled = false;
                canRequestNewCode = true;
            }
        }, 1000);
    }

    requestCodeButton.addEventListener('click', async () => {
        if (!canRequestNewCode) return;

        requestCodeMessage.textContent = 'Sending code...';
        try {
            const response = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (response.ok && data.message === 'Verification code sent') {
                requestCodeSection.classList.add('hidden');
                verifyCodeSection.classList.remove('hidden');
                requestCodeMessage.textContent = '';
                startExpirationTimer(60);
            } else {
                requestCodeMessage.textContent = data.error || 'Failed to send code.';
                if (data.retryAfter) {
                    startCooldownTimer(data.retryAfter);
                } else {
                    startCooldownTimer(120); // Default cooldown
                }
            }
        } catch (error) {
            console.error('Error requesting code:', error);
            requestCodeMessage.textContent = 'Failed to request code.';
            startCooldownTimer(120);
        }
    });

    verifyCodeButton.addEventListener('click', async () => {
        const code = Array.from(codeInputs).map(input => input.value).join('');
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            verifyCodeMessage.textContent = 'Please enter the 6-digit code.';
            return;
        }

        verifyCodeMessage.textContent = 'Verifying code...';
        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code }),
            });
            const data = await response.json();
            if (response.ok && data.message === 'Email verified') {
                clearInterval(expirationInterval);
                verifyCodeSection.classList.add('hidden');
                verificationSuccessDiv.classList.remove('hidden');
                verifyCodeMessage.textContent = '';
            } else {
                verifyCodeMessage.textContent = data.error || 'Verification failed. Try again.';
                verificationErrorDiv.classList.remove('hidden');
                // Optionally, you might want to track failed attempts here on the front-end as well
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            verifyCodeMessage.textContent = 'Verification failed. Please try again.';
            verificationErrorDiv.classList.remove('hidden');
        }
    });

    if (proceedQuotationButton) {
        proceedQuotationButton.addEventListener('click', () => {
            window.location.href = '/prompt-quotation';
        });
    }

    if (requestNewCodeButton) {
        requestNewCodeButton.addEventListener('click', () => {
            verificationErrorDiv.classList.add('hidden');
            requestCodeSection.classList.remove('hidden');
        });
    }

    // Focus on the first input box when the verify section is shown
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class' && verifyCodeSection.classList.contains('hidden') === false) {
                codeInputs[0]?.focus();
                observer.disconnect(); // Stop observing after focus
                break;
            }
        }
    });

    observer.observe(verifyCodeSection, { attributes: true });

    // Automatically move focus between input boxes
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Backspace' && input.value.length === 0 && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
});
