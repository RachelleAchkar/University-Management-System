const express = require('express');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();


// Set storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Specify the 'uploads' folder to store files
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to allow only PDFs, JPG, and PNG files
const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf|jpeg|jpg|png/;
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only PDF, JPG, PNG files are allowed!'), false);  // Reject the file
  }
};

// Initialize multer with storage and file filter configurations
const upload = multer({ storage: storage, fileFilter: fileFilter });


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


// Route to Add New Instructor
app.post("/instructor/add", upload.fields([{ name: 'image' }, { name: 'cv' }]), async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phonenumber,
    hiredate,
    dob,
    salary,
    address,
    majorid,
  } = req.body;

  // Get the uploaded files
  const imagePath = req.files['image'] ? req.files['image'][0].path : undefined;
  const cvPath = req.files['cv'] ? req.files['cv'][0].path : undefined;

  // Validate required fields
  if (
    !firstname ||
    !lastname ||
    !email ||
    !phonenumber ||
    !hiredate ||
    !dob ||
    !salary ||
    !majorid ||
    !imagePath ||
    !cvPath
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Read the image and CV files as binary data
    const imageBinary = fs.readFileSync(imagePath); // Read image file
    const cvBinary = fs.readFileSync(cvPath); // Read CV file

    // Ensure the majorId exists in the major collection
    const major = await db.collection("majors").findOne({ _id: new ObjectId(majorid) });

    if (!major) {
      return res.status(400).json({ message: "Invalid majorId. Major not found." });
    }

    // Create the new instructor object
    const newInstructor = {
      firstname,
      lastname,
      email,
      phonenumber,
      address,
      hiredate: new Date(hiredate),  // Ensure hiredate is a Date object
      dob: new Date(dob),            // Ensure dob is a Date object
      salary: parseFloat(salary), // Ensure salary is a number
      image: imageBinary,            // Binary data for image
      cv: cvBinary,                  // Binary data for CV
      majorid: new ObjectId(majorid), // Ensure majorid is a valid ObjectId
    };

    console.log(newInstructor);  // Check if the structure matches the schema

    // Insert the new instructor into the database
    const result = await db.collection("instructor").insertOne(newInstructor);

    res.status(201).json({
      message: "Instructor added successfully.",
      instructorId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Get all instructors for a specific major
app.get('/instructors/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    // Fetch all instructors related to the majorId
    const instructors = await db.collection('instructor').find({ majorid: new ObjectId(majorId) }).toArray();

    if (instructors.length === 0) {
      return res.status(404).json({ message: 'No instructors found for this major.' });
    }

    res.status(200).json(instructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route to Add New Course
app.post('/courses/addCourse', async (req, res) => {
  const { courseName, credits, description, gradeLevel, semesterNumber, majorId, instructorId, courseType } = req.body;

  // Validate required fields
  if (!courseName || !credits || !description || !gradeLevel || !semesterNumber || !majorId || !instructorId || !courseType) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate courseType value
  if (!['Mandatory', 'Optional'].includes(courseType)) {
    return res.status(400).json({ message: 'Invalid courseType. Must be either "Mandatory" or "Optional".' });
  }

  try {
    // Ensure the majorId exists in the majors collection
    const major = await db.collection('majors').findOne({ _id: new ObjectId(majorId) });
    if (!major) {
      return res.status(400).json({ message: 'Invalid majorId. Major not found.' });
    }

    // Ensure the instructorId exists in the instructors collection
    const instructor = await db.collection('instructor').findOne({ _id: new ObjectId(instructorId) });
    if (!instructor) {
      return res.status(400).json({ message: 'Invalid instructorId. Instructor not found.' });
    }

    // Create the new course object
    const newCourse = {
      courseName,
      credits: parseInt(credits),
      description,
      gradeLevel,
      semesterNumber: parseInt(semesterNumber),
      majorId: new ObjectId(majorId),
      instructorId: new ObjectId(instructorId),
      courseType, // Added courseType field
    };

    // Insert the course into the courses collection
    const result = await db.collection('courses').insertOne(newCourse);

    res.status(201).json({
      message: 'Course added successfully.',
      courseId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});



// Get Courses by MajorId Route
app.get('/courses/major/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    // Find courses related to the majorId
    const courses = await db
      .collection('courses')
      .find({ majorId: new ObjectId(majorId) })
      .toArray();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route: Get courses for grade level > 1 or credits between 3 and 6
app.get('/courses/filtered/:majorId', async (req, res) => {
  const { instructorId } = req.query; // Get instructorId from query params

  try {
    const query = {
      $or: [
        { gradeLevel: { $gt: "First Year" } },
        { credits: { $gte: 3, $lte: 6 } }
      ]
    };

    const courses = await db.collection('courses').find(query).toArray();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found matching the criteria.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});


// Route: Get courses for grade level = "Second Year", semester number > 2
app.get('/courses/secondYearSemester/:majorId', async (req, res) => {
  const { instructorId } = req.query; // Get instructorId from query parameters

  try {
    // Build the query object
    const query = {
      gradeLevel: "Second Year", // Match grade level "Second Year"
      semesterNumber: { $gt: 2 }, // Filter for semesterNumber greater than 2
    };

    const courses = await db.collection('courses').find(query).toArray();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found matching the criteria.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route: Get courses for courseType = "Optional" and gradeLevel = "Third Year"
app.get('/courses/optionalThirdYear/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    // Build the query object
    const query = {
      majorId: new ObjectId(majorId), // Match majorId
      courseType: "Optional", // Match courseType "Optional"
      gradeLevel: "Third Year" // Match gradeLevel "Third Year"
    };

    // Find courses based on the query
    const courses = await db.collection('courses').find(query).toArray();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No optional third-year courses found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});
// Route: Get courses where courseType = "Mandatory" and (credits = 3 OR semesterNumber = 4)
app.get('/courses/mandatoryFiltered/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    // Build the query object
    const query = {
      majorId: new ObjectId(majorId), // Match majorId
      courseType: "Mandatory", // Match courseType "Mandatory"
      $or: [
        { credits: 3 }, // Match courses with credits = 3
        { semesterNumber: 4 } // Match courses with semesterNumber = 4
      ]
    };

    // Find courses based on the query
    const courses = await db.collection('courses').find(query).toArray();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No mandatory courses with the specified criteria found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route to calculate the average salary of instructors
app.get('/instructors/aggregate/salary', async (req, res) => {
  try {
    // Use MongoDB aggregation pipeline to calculate the average salary
    const result = await db.collection('instructor').aggregate([
      {
        $group: {
          _id: null, // Grouping all documents (no specific group key)
          averageSalary: { $avg: '$salary' }, // Calculate the average of the salary field
        },
      },
    ]).toArray();

    // Check if any data exists
    if (result.length === 0) {
      return res.status(404).json({ message: 'No instructors found to calculate the average salary.' });
    }

    res.status(200).json({
      message: 'Average salary calculated successfully.',
      averageSalary: result[0].averageSalary, // Extract the calculated average
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





  