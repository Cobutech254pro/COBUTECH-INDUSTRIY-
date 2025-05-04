console.log('verification.js file has loaded!');

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';

// Firebase configuration (replace with your actual config - although it's not directly used in this file currently)
const firebaseConfig = {
    apiKey: "AIzaSyCmk6NU1uiCnb6syjOmgTjpq5qBP5QyQAY",
    authDomain: "cobu-tech-portal.firebaseapp.com",
    projectId: "cobu-tech-portal",
    storageBucket: "cobu-tech-portal.firebasestorage.app",
    messagingSenderId: "61919067593",
    appId: "1:61919067593:web:5a60042df8622d6edb3c18"
};

// Initialize Firebase (although not directly used in this script)
const app = initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
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
    const requestNewCodeButton = document.getElementById('request-new-code-button'); // Added this

    // State variables
    let expirationInterval;
    let canRequestNewCode = true;
    let cooldownTimeRemaining = 0;
    let requestAttempts = 0;

    // --- UI State Management ---
    const showSection = (section) => {
        const sections = [requestCodeSection, verifyCodeSection, verificationSuccessDiv, verificationErrorDiv];
        sections.forEach(sec => sec.classList.add('hidden'));
        section?.classList.remove('hidden');
    };

    const showTimer = (timerDisplay, show) => {
        timerDisplay.classList.toggle('hidden', !show);
    };

    const enableRequestButton = (enable) => {
        requestCodeButton.disabled = !enable;
        canRequestNewCode = enable;
        if (enable) {
            requestCodeMessage.textContent = '';
        }
    };

    // --- Timer Functions ---
    function startExpirationTimer(duration) {
        clearInterval(expirationInterval);
        showTimer(codeExpirationTimerDisplay, true);
        let timeLeft = duration;
        codeExpirationTimerDisplay.textContent = `Code expires in ${timeLeft} seconds`;
        expirationInterval = setInterval(() => {
            timeLeft--;
            codeExpirationTimerDisplay.textContent = `Code expires in ${timeLeft} seconds`;
            if (timeLeft <= 0) {
                clearInterval(expirationInterval);
                showTimer(codeExpirationTimerDisplay, false);
                verifyCodeMessage.textContent = 'Verification code expired. Request a new one.';
                showSection(requestCodeSection);
                showSection(verifyCodeSection, false);
            }
        }, 1000);
    }

    function startCooldownTimer(duration) {
        enableRequestButton(false);
        cooldownTimeRemaining = duration;
        showTimer(newCodeCooldownTimerDisplay, true);
        newCodeCooldownTimerDisplay.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
        clearInterval(cooldownInterval);
        const cooldownInterval = setInterval(() => {
            cooldownTimeRemaining--;
            newCodeCooldownTimerDisplay.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
            if (cooldownTimeRemaining <= 0) {
                clearInterval(cooldownInterval);
                showTimer(newCodeCooldownTimerDisplay, false);
                enableRequestButton(true);
            }
        }, 1000);
    }

    // --- Event Listeners ---
    requestCodeButton.addEventListener('click', async () => {
        if (!canRequestNewCode) return;

        requestCodeMessage.textContent = 'Requesting code...';
        try {
            const response = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (response.ok && data.message === 'Verification code sent') {
                showSection(verifyCodeSection);
                requestCodeMessage.textContent = '';
                startExpirationTimer(60);
                requestAttempts = 0; // Reset attempts on successful request
            } else {
                requestCodeMessage.textContent = data.error || 'Failed to request code.';
                requestAttempts++;
                if (requestAttempts >= 3) {
                    enableRequestButton(false);
                    requestCodeMessage.textContent = 'Too many request attempts. You can request again after 24 hours.';
                    startCooldownTimer(24 * 60 * 60); // 24 hours in seconds
                } else if (data.retryAfter) {
                    startCooldownTimer(data.retryAfter);
                } else {
                    startCooldownTimer(20); // Your specified 20-second cooldown
                }
            }
        } catch (error) {
            console.error('Error requesting code:', error);
            requestCodeMessage.textContent = 'Failed to request code.';
            requestAttempts++;
            if (requestAttempts >= 3) {
                enableRequestButton(false);
                requestCodeMessage.textContent = 'Too many request attempts. You can request again after 24 hours.';
                startCooldownTimer(24 * 60 * 60); // 24 hours in seconds
            } else {
                startCooldownTimer(20); // Your specified 20-second cooldown
            }
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
                showSection(verificationSuccessDiv);
                verifyCodeMessage.textContent = '';
                setTimeout(() => {
                    window.location.href = '/prompt-quotation';
                }, 1500); // Short delay for visual feedback
            } else {
                verifyCodeMessage.textContent = 'Verification failed. Please check the code.';
                codeInputs.forEach(input => {
                    input.classList.add('incorrect-code'); // Add a CSS class (you need to define this in your CSS)
                    setTimeout(() => {
                        input.classList.remove('incorrect-code');
                        input.value = '';
                    }, 1000);
                });
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            verifyCodeMessage.textContent = 'Verification failed. Please try again.';
        }
    });

    if (proceedQuotationButton) {
        proceedQuotationButton.addEventListener('click', () => {
            window.location.href = '/prompt-quotation';
        });
    }

    if (requestNewCodeButton) {
        requestNewCodeButton.addEventListener('click', () => {
            showSection(requestCodeSection);
            showSection(verificationErrorDiv, false);
            verifyCodeMessage.textContent = '';
        });
    }

    // --- Input Focus Handling ---
    const focusFirstInput = () => {
        if (!verifyCodeSection.classList.contains('hidden')) {
            codeInputs[0]?.focus();
        }
    };

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class' && !verifyCodeSection.classList.contains('hidden')) {
                focusFirstInput();
                observer.disconnect(); // Observe only once when section becomes visible
                break;
            }
        }
    });

    observer.observe(verifyCodeSection, { attributes: true });

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

    // Initial state
    showSection(requestCodeSection);
});
