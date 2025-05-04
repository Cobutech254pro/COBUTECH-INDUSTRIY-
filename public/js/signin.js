// Firebase imports (use CDN-compatible module imports)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmk6NU1uiCnb6syjOmgTjpq5qBP5QyQAY",
  authDomain: "cobu-tech-portal.firebaseapp.com",
  projectId: "cobu-tech-portal",
  storageBucket: "cobu-tech-portal.firebasestorage.app",
  messagingSenderId: "61919067593",
  appId: "1:61919067593:web:5a60042df8622d6edb3c18"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const nextStepButton = document.getElementById('next-step');
  const prevStepButton = document.getElementById('prev-step');
  const signupButton = document.getElementById('signup-button');
  const googleSigninButton = document.querySelector('.google-signin-button');

  let signupEmail, signupName;

  nextStepButton?.addEventListener('click', () => {
    signupEmail = document.getElementById('signup-email')?.value;
    signupName = document.getElementById('signup-name')?.value;

    if (signupEmail && signupName) {
      step1.classList.remove('active');
      step2.classList.add('active');
    } else {
      alert('Please enter your email and name.');
    }
  });

  prevStepButton?.addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
  });

  async function handleSuccessfulSignup(user) {
    try {
      await sendEmailVerification(user);
      console.log('Verification email sent.');
      alert('Sign up successful! Please check your email to verify your account.');
      window.location.href = '/public/verification.html'; // Redirect to verification page
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Sign up successful, but failed to send verification email. Please request it on the verification page.');
      window.location.href = '/public/verification.html'; // Still redirect
    }
  }

  signupButton?.addEventListener('click', async () => {
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    const termsChecked = document.getElementById('terms')?.checked;

    if (!password || !confirmPassword || password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!termsChecked) {
      alert('Please agree to the terms.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, password);
      console.log('User created:', userCredential.user);
      await handleSuccessfulSignup(userCredential.user); // Send verification email and redirect
    } catch (error) {
      console.error('Sign up error:', error);
      alert(error.message);
    }
  });

  googleSigninButton?.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: user.displayName,
          email: user.email,
          googleToken: token
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await handleSuccessfulSignup(user); // Send verification email and redirect
      } else {
        alert(`Google sign-in failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert(`Google sign-in error: ${error.message}`);
    }
  });
});
