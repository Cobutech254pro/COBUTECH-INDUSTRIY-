const admin = require('firebase-admin');
const mongoose = require('mongoose');
const User = require('../models/userModel');

exports.signup = async (req, res) => {
    const { email, name, password, firebaseUid, googleToken } = req.body;

    try {
        let uid = firebaseUid;

        if (!uid && email && password) {
            const firebaseUser = await admin.auth().createUser({
                email: email,
                password: password
            });
            uid = firebaseUser.uid;
        } else if (!uid && googleToken) {
            // Verify Google ID token if needed for extra security
            // const decodedToken = await admin.auth().verifyIdToken(googleToken);
            // uid = decodedToken.uid;
            // For simplicity, we'll trust the front-end for now after successful popup
            if (!req.body.name || !req.body.email) {
                return res.status(400).json({ error: 'Name and email are required for Google sign-in.' });
            }
        }

        if (!uid) {
            return res.status(400).json({ error: 'No Firebase UID provided.' });
        }

        const newUser = new User({
            firebaseUid: uid,
            name: name,
            email: email
        });

        await newUser.save();

        return res.status(201).json({ message: 'Registration successful!' });

    } catch (error) {
        console.error('Error during signup:', error);

        if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ error: 'Email address is already in use.' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: 'Invalid email address.' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'Password is too weak.' });
        }
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        return res.status(500).json({ error: 'Failed to create user.' });
    }
};
