document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextStepButton = document.getElementById('next-step');
    const prevStepButton = document.getElementById('prev-step');
    const signupButton = document.getElementById('signup-button');
    const googleSigninButton = document.querySelector('.google-signin-button');

    if (nextStepButton) {
        nextStepButton.addEventListener('click', () => {
            step1.classList.remove('active');
            step2.classList.add('active');
        });
    }

    if (prevStepButton) {
        prevStepButton.addEventListener('click', () => {
            step2.classList.remove('active');
            step1.classList.add('active');
        });
    }

    if (signupButton) {
        signupButton.addEventListener('click', () => {
            // TODO: Implement form validation and submission to backend
            const email = document.getElementById('signup-email').value;
            const name = document.getElementById('signup-name').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;

            if (password === confirmPassword && terms) {
                // TODO: Integrate with Firebase and send data to backend
                console.log('Signing up with:', { email, name, password });
                // Example of a fetch request (replace with your actual API endpoint)
                fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, name, password }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // TODO: Handle success (e.g., redirect user)
                })
                .catch((error) => {
                    console.error('Error:', error);
                    // TODO: Handle error (e.g., display error message to user)
                });
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
