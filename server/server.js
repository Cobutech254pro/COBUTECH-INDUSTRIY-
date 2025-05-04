require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const authRoutes = require('./routes/authRoutes'); // Assuming this is the path to your auth routes
const path = require('path'); // Import the 'path' module

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public'))); // Adjust path as needed

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
} catch (error) {
  console.error('Error parsing FIREBASE_ADMIN_CREDENTIALS:', error);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.warn('Firebase Admin SDK not initialized due to missing or invalid credentials.');
}

// Use authentication routes
app.use('/api/auth', authRoutes);

// Handle all other requests by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); // Adjust path as needed
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
