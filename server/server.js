const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const authRoutes = require('./routes/authRoutes'); // Assuming this is the path to your auth routes

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Initialize Firebase Admin SDK (Make sure you have the credentials set as an environment variable)
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Use authentication routes
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
