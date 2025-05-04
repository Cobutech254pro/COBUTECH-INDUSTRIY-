// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmk6NU1uiCnb6syjOmgTjpq5qBP5QyQAY",
  authDomain: "cobu-tech-portal.firebaseapp.com",
  projectId: "cobu-tech-portal",
  storageBucket: "cobu-tech-portal.firebasestorage.app",
  messagingSenderId: "61919067593",
  appId: "1:61919067593:web:5a60042df8622d6edb3c18"
};

let app;
let auth;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase app initialized successfully.'); // ADDED LOG
} catch (error) {
    console.error('Error initializing Firebase app:', error); // ADDED ERROR HANDLING
    alert('Failed to initialize Firebase. Please check the console for details.');
}

document.addEventListener('DOMContentLoaded', () => {
    try {
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
                console.log('Next button clicked!'); // Existing LOG
                signupEmail = document.getElementById('signup-email').value;
                signupName = document.getElementById('signup-name').value;
                console.log('Email:', signupEmail, 'Name:', signupName); // Existing LOG

                if (signupEmail && signupName) {
                    console.log('Email and name are valid. Moving to step 2.'); // Existing LOG
                    step1.classList.remove('active');
                    step2.classList.add('active');
                } else {
                    console.log('Email or name is empty. Showing alert.'); // Existing LOG
                    alert('Please enter your email and name.');
                }
            });
        }

        if (prevStepButton) {
            prevStepButton.addEventListener('click', () => {
                console.log('Previous button clicked!'); // Existing LOG
                step2.classList.remove('active');
                step1.classList.add('active');
            });
        }

        if (signupButton) {
            signupButton.addEventListener('click', async () => {
                // ... (rest of your signup button logic - no changes here for now)
            });
        }

        if (googleSigninButton) {
            googleSigninButton.addEventListener('click', async () => {
                console.log('Google Sign-in button clicked!'); // Existing LOG
                const provider = new GoogleAuthProvider();
                try {
                    console.log('Attempting to sign in with Google...'); // Existing LOG
                    const result = await signInWithPopup(auth, provider);
                    const user = result.user;
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential?.accessToken;

                    console.log('Signed in with Google:', user);

                    const response = await fetch('/api/auth/signup', { // Or a dedicated endpoint
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ firebaseUid: user.uid, name: user.displayName, email: user.email, googleToken: token }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        console.log('Backend Google sign-in successful:', data);
                        alert('Google sign-in successful!');
                        window.location.href = '/public/index.html';
                    } else {
                        console.error('Backend Google sign-in failed:', data);
                        alert(`Google sign-in failed: ${data.error || 'Something went wrong.'}`);
                    }

                } catch (error) {
                    console.error('Google sign-in error:', error); // Existing ERROR LOG
                    alert(`Google sign-in error: ${error.message}`); // Existing ALERT
                }
            });
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error); // ADDED ERROR HANDLING
        alert('An error occurred during page setup. Please check the console for details.');
    }
});
