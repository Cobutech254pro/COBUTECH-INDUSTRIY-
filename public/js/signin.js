// Import Firebase SDK (assuming you've included it in your HTML via CDN or build process)
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Your web app's Firebase configuration (replace with your actual config)
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
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextStepButton = document.getElementById('next-step');
    const prevStepButton = document.getElementById('prev-step');
    const signupButton = document.getElementById('signup-button');
    const googleSigninButton = document.querySelector('.google-signin-button');

    let signupEmail;
    let signupName;

    if (nextStepButton) {
        nextStepButton.addEventListener('click', () => {
            signupEmail = document.getElementById('signup-email').value;
            signupName = document.getElementById('signup-name').value;

            // Basic client-side validation for step 1
            if (signupEmail && signupName) {
                step1.classList.remove('active');
                step2.classList.add('active');
            } else {
                alert('Please enter your email and name.');
            }
        });
    }

    if (prevStepButton) {
        prevStepButton.addEventListener('click', () => {
            step2.classList.remove('active');
            step1.classList.add('active');
        });
    }

    if (signupButton) {
        signupButton.addEventListener('click', async () => {
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;

            if (password === confirmPassword && terms) {
                try {
                    // 1. Create user with Firebase
                    const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, password);
                    const user = userCredential.user;
                    console.log('Firebase user created:', user);

                    // 2. Send Firebase UID and name to your backend
                    const response = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ firebaseUid: user.uid, name: signupName, email: signupEmail }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        console.log('Backend registration successful:', data);
                        // TODO: Handle successful registration (e.g., redirect user)
                        alert('Registration successful!');
                        window.location.href = '/public/index.html'; // Redirect to welcome page for now
                    } else {
                        console.error('Backend registration failed:', data);
                        // TODO: Display error message to the user
                        alert(`Registration failed: ${data.error || 'Something went wrong.'}`);
                    }

                } catch (error) {
                    console.error('Firebase sign up error:', error);
                    let errorMessage = 'An error occurred during sign up.';
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'This email address is already in use.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address.';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password should be at least 6 characters.';
                    }
                    alert(errorMessage);
                    // TODO: Display Firebase error message to the user
                }
            } else {
                if (password !== confirmPassword) {
                    alert('Passwords do not match.');
                }
                if (!terms) {
                    alert('Please agree to the terms and conditions.');
                }
            }
        });
    }

    if (googleSigninButton) {
        googleSigninButton.addEventListener('click', () => {
            // TODO: Implement Google Sign-in functionality with Firebase
            console.log('Signing up with Google');
        });
    }
});
