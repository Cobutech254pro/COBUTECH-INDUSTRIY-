console.log('verification.js file has loaded!');

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';

const firebaseConfig = {
  apiKey: "AIzaSyCmk6NU1uiCnb6syjOmgTjpq5qBP5QyQAY",
  authDomain: "cobu-tech-portal.firebaseapp.com",
  projectId: "cobu-tech-portal",
  storageBucket: "cobu-tech-portal.firebasestorage.app",
  messagingSenderId: "61919067593",
  appId: "1:61919067593:web:5a60042df8622d6edb3c18"
};

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
  let cooldownInterval;
  let canRequestNewCode = true;
  let cooldownTimeRemaining = 0;
  let requestAttempts = 0;

  const showSection = (section) => {
    [requestCodeSection, verifyCodeSection, verificationSuccessDiv, verificationErrorDiv].forEach(sec =>
      sec.classList.add('hidden')
    );
    section?.classList.remove('hidden');
  };

  const showTimer = (el, show) => el.classList.toggle('hidden', !show);

  const enableRequestButton = (enable) => {
    requestCodeButton.disabled = !enable;
    canRequestNewCode = enable;
    if (enable) requestCodeMessage.textContent = '';
  };

  function startExpirationTimer(duration) {
    clearInterval(expirationInterval);
    showTimer(codeExpirationTimerDisplay, true);
    let timeLeft = duration;
    expirationInterval = setInterval(() => {
      timeLeft--;
      codeExpirationTimerDisplay.textContent = `Code expires in ${timeLeft} seconds`;
      if (timeLeft <= 0) {
        clearInterval(expirationInterval);
        showTimer(codeExpirationTimerDisplay, false);
        verifyCodeMessage.textContent = 'Verification code expired. Request a new one.';
        showSection(requestCodeSection);
      }
    }, 1000);
  }

  function startCooldownTimer(duration) {
    enableRequestButton(false);
    cooldownTimeRemaining = duration;
    showTimer(newCodeCooldownTimerDisplay, true);
    newCodeCooldownTimerDisplay.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
    clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
      cooldownTimeRemaining--;
      newCodeCooldownTimerDisplay.textContent = `Wait ${cooldownTimeRemaining} seconds to request a new code`;
      if (cooldownTimeRemaining <= 0) {
        clearInterval(cooldownInterval);
        showTimer(newCodeCooldownTimerDisplay, false);
        enableRequestButton(true);
      }
    }, 1000);
  }

  requestCodeButton.addEventListener('click', async () => {
    if (!canRequestNewCode) return;

    requestCodeMessage.textContent = 'Requesting code...';

    try {
      const emailInput = document.getElementById('email-input'); // Add input for email
      const email = emailInput?.value;
      if (!email) {
        requestCodeMessage.textContent = 'Email is required.';
        return;
      }

      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.message?.includes('sent')) {
        showSection(verifyCodeSection);
        requestCodeMessage.textContent = '';
        startExpirationTimer(60);
        requestAttempts = 0;
      } else {
        requestCodeMessage.textContent = data.message || 'Failed to request code.';
        handleCooldown();
      }
    } catch (err) {
      console.error('Error:', err);
      requestCodeMessage.textContent = 'Failed to request code.';
      handleCooldown();
    }

    function handleCooldown() {
      requestAttempts++;
      if (requestAttempts >= 3) {
        enableRequestButton(false);
        requestCodeMessage.textContent = 'Too many requests. Try again after 24 hours.';
        startCooldownTimer(86400);
      } else {
        startCooldownTimer(20);
      }
    }
  });

  verifyCodeButton.addEventListener('click', async () => {
    const code = Array.from(codeInputs).map(i => i.value).join('');
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      verifyCodeMessage.textContent = 'Enter the 6-digit code.';
      return;
    }

    verifyCodeMessage.textContent = 'Verifying...';

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (res.ok && data.message === 'Email verified') {
        clearInterval(expirationInterval);
        showSection(verificationSuccessDiv);
        verifyCodeMessage.textContent = '';
        setTimeout(() => (window.location.href = '/prompt-quotation'), 1500);
      } else {
        verifyCodeMessage.textContent = 'Verification failed. Try again.';
        codeInputs.forEach(i => {
          i.classList.add('incorrect-code');
          setTimeout(() => {
            i.classList.remove('incorrect-code');
            i.value = '';
          }, 1000);
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      verifyCodeMessage.textContent = 'Verification failed. Try again.';
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

  const focusFirstInput = () => {
    if (!verifyCodeSection.classList.contains('hidden')) codeInputs[0]?.focus();
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.attributeName === 'class' && !verifyCodeSection.classList.contains('hidden')) {
        focusFirstInput();
        observer.disconnect();
      }
    });
  });

  observer.observe(verifyCodeSection, { attributes: true });

  codeInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && i < codeInputs.length - 1) codeInputs[i + 1].focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && i > 0) codeInputs[i - 1].focus();
    });
  });

  showSection(requestCodeSection);
});
