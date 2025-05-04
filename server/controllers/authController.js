
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const User = require('../models/userModel'); // Assuming you have your User model defined

exports.signup = async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // 1. Create user in Firebase Authentication
        const firebaseUser = await admin.auth().createUser({
            email: email,
            password: password
        });

        // 2. If Firebase user creation is successful, store additional data in MongoDB
        const newUser = new User({
            firebaseUid: firebaseUser.uid,
            name: name,
            email: email // You might want to store email in MongoDB as well
        });

        await newUser.save();

        // 3. Send success response
        return res.status(201).json({ message: 'Registration successful!' });

    } catch (error) {
        console.error('Error during signup:', error);

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ error: 'Email address is already in use.' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: 'Invalid email address.' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'Password is too weak.' });
        }

        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        // Handle other errors
        return res.status(500).json({ error: 'Failed to create user.' });
    }
};
            
