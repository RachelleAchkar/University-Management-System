const express = require('express');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's URL
}));

// Define constants
const PORT = 8080;
const MONGO_URI = 'mongodb://127.0.0.1:27017/universitymanagementsystem';


let db;

// Connect to MongoDB
MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db();
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Sign-Up Route for Administrators
app.post('/admin/signup', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
  
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      const existingAdmin = await db.collection('administrator').findOne({ email });
  
      if (existingAdmin) {
        return res.status(400).json({ message: 'Administrator already exists.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newAdmin = {
        firstname,
        lastname,
        email,
        password: hashedPassword,
      };
  
      const result = await db.collection('administrator').insertOne(newAdmin);
  
      // Access the inserted _id and send it back in the response
      res.status(201).json({
        message: 'Administrator created successfully.',
        adminId: result.insertedId.toString(), // Convert ObjectId to string
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  
  
  // Sign In Route for Administrators
  app.post('/admin/signin', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
  
    try {
      const admin = await db.collection('administrator').findOne({ email });
  
      if (!admin) {
        return res.status(400).json({ message: 'Administrator not found.' });
      }
  
      const isMatch = await bcrypt.compare(password, admin.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }
  
      res.json({
        message: 'Signed in successfully.',
        adminId: admin._id,  // Send back the MongoDB object _id
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });