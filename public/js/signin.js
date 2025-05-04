import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCmk6NU1uiCnb6syjOmgTjpq5qBP5QyQAY",
  authDomain: "cobu-tech-portal.firebaseapp.com",
  projectId: "cobu-tech-portal",
  storageBucket: "cobu-tech-portal.appspot.com",
  messagingSenderId: "61919067593",
  appId: "1:61919067593:web:5a60042df8622d6edb3c18"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const nextStepButton = document.getElementById('next-step');
  const prevStepButton = document.getElementById('prev-step');
  const signupButton = document.getElementById('signup-button');
  const googleSigninButton = document.querySelector('.google-signin-button');

  nextStepButton?.addEventListener('click', () => {
    const email = document.getElementById('signup-email');
    const name = document.getElementById('signup-name');
    const emailError = document.getElementById('email-error');
    const nameError = document.getElementById('name-error');

    let valid = true;

    if (!email.value.trim()) {
      email.classList.add('error');
      emailError.textContent = 'Please enter your email.';
      valid = false;
    } else {
      email.classList.remove('error');
      emailError.textContent = '';
    }

    if (!name.value.trim()) {
      name.classList.add('error');
      nameError.textContent = 'Please enter your name.';
      valid = false;
    } else {
      name.classList.remove('error');
      nameError.textContent = '';
    }

    if (valid) {
      step1.classList.remove('active');
      step2.classList.add('active');
    }
  });

  prevStepButton?.addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
  });

  signupButton?.addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password');
    const confirm = document.getElementById('confirm-password');
    const passwordError = document.getElementById('password-error');

    if (password.value !== confirm.value) {
      password.classList.add('error');
      confirm.classList.add('error');
      passwordError.textContent = 'Passwords do not match.';
      return;
    }

    password.classList.remove('error');
    confirm.classList.remove('error');
    passwordError.textContent = '';

    try {
      await createUserWithEmailAndPassword(auth, email, password.value);
      window.location.href = '/public/verify.html';
    } catch (err) {
      alert('Signup failed: ' + err.message);
    }
  });

  googleSigninButton?.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: user.displayName,
          email: user.email
        }),
      });

      window.location.href = '/public/verify.html';
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert(`Google sign-in error: ${error.message}`);
    }
  });
});
