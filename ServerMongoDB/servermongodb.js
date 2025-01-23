const express = require('express');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

const PORT = 8081;
const MONGO_URI = 'mongodb://127.0.0.1:27017/universitymanagementsystem';

let db;

// Connect to MongoDB
MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db();
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

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
  
  // Add Faculty Route
app.post('/faculties', async (req, res) => {
  const { facultyname, adminId } = req.body;

  // Validate the required fields
  if (!facultyname || !adminId) {
    return res.status(400).json({ message: 'Faculty name and adminId are required.' });
  }

  try {
    // Ensure the provided adminId exists in the administrator collection
    const admin = await db.collection('administrator').findOne({ _id: new ObjectId(adminId) });

    if (!admin) {
      return res.status(400).json({ message: 'Admin not found. Please provide a valid adminId.' });
    }

    // Prepare the new faculty object
    const newFaculty = {
      facultyname,
      adminId: new ObjectId(adminId), // Store the adminId as an ObjectId
    };

    // Insert the new faculty into the "faculty" collection
    const result = await db.collection('faculty').insertOne(newFaculty);

    res.status(201).json({
      message: 'Faculty added successfully.',
      facultyId: result.insertedId.toString(), // Send the facultyId as a response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get Faculties by Admin
app.get('/faculties/:adminId', async (req, res) => {
  const { adminId } = req.params;

  try {
    // Validate adminId
    if (!ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: 'Invalid adminId.' });
    }

    // Find faculties related to the adminId
    const faculties = await db
      .collection('faculty')
      .find({ adminId: new ObjectId(adminId) })
      .toArray();

    if (faculties.length === 0) {
      return res.status(404).json({ message: 'No faculties found for this admin.' });
    }

    res.status(200).json({ faculties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});


// Add Department
app.post('/departments', async (req, res) => {
  const { departmentName, facultyID } = req.body;

  // Validate required fields
  if (!departmentName || !facultyID) {
    return res.status(400).json({ message: 'Department name and facultyID are required.' });
  }

  try {
    // Ensure the provided facultyID exists in the faculty collection
    const faculty = await db.collection('faculty').findOne({ _id: new ObjectId(facultyID) });

    if (!faculty) {
      return res.status(400).json({ message: 'Faculty not found. Please provide a valid facultyID.' });
    }

    // Prepare the new department object
    const newDepartment = {
      departmentName,
      facultyID: new ObjectId(facultyID), // Store the facultyID as an ObjectId
    };

    // Insert the new department into the "department" collection
    const result = await db.collection('department').insertOne(newDepartment);

    res.status(201).json({
      message: 'Department added successfully.',
      departmentId: result.insertedId.toString(), // Send the departmentId as a response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get Departments by Faculty Id
app.get('/departments/faculty/:facultyId', async (req, res) => {
  const { facultyId } = req.params;

  try {
    // Validate facultyId
    if (!ObjectId.isValid(facultyId)) {
      return res.status(400).json({ message: 'Invalid facultyId.' });
    }

    // Find departments related to the facultyId
    const departments = await db
      .collection('department')
      .find({ facultyID: new ObjectId(facultyId) })
      .toArray();

    if (departments.length === 0) {
      return res.status(404).json({ message: 'No departments found for this faculty.' });
    }

    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add Major Route
app.post('/majors', async (req, res) => {
  const { majorName, description, departmentId } = req.body;

  // Validate the required fields
  if (!majorName || !description || !departmentId) {
    return res.status(400).json({ message: 'Major name, description, and departmentId are required.' });
  }

  try {
    // Ensure the provided departmentId exists in the department collection
    const department = await db.collection('department').findOne({ _id: new ObjectId(departmentId) });

    if (!department) {
      return res.status(400).json({ message: 'Department not found. Please provide a valid departmentId.' });
    }

    // Prepare the new major object
    const newMajor = {
      majorName,
      description,
      departmentId: new ObjectId(departmentId), // Store the departmentId as an ObjectId
    };

    // Insert the new major into the "majors" collection
    const result = await db.collection('majors').insertOne(newMajor);

    res.status(201).json({
      message: 'Major added successfully.',
      majorId: result.insertedId.toString(), // Send the majorId as a response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get All Majors by DepartmentId Route
app.get('/majors/:departmentId', async (req, res) => {
  const { departmentId } = req.params;

  try {
    // Validate the departmentId
    if (!ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid departmentId.' });
    }

    // Fetch majors based on the departmentId
    const majors = await db.collection('majors').find({ departmentId: new ObjectId(departmentId) }).toArray();

    if (majors.length === 0) {
      return res.status(404).json({ message: 'No majors found for the given departmentId.' });
    }

    res.status(200).json(majors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });