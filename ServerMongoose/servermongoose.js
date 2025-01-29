const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

// Initialize app
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

const PORT = 8081;
const MONGO_URI = "mongodb://127.0.0.1:27017/universitymanagementsystemMongoose";

// Connect to MongoDB using Mongoose
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Define Schemas and Models
const AdminSchema = new mongoose.Schema({
  firstname: { 
    type: String, 
    required: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name must be less than 50 characters']
  },
  lastname: { 
    type: String, 
    required: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name must be less than 50 characters']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(v) {
        // Check if password contains at least one number, one uppercase letter, and one special character
        return /[A-Z]/.test(v) && /\d/.test(v) && /[!@#$%^&*(),.?":{}|<>]/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one number, and one special character'
    }
  }
});

const FacultySchema = new mongoose.Schema({
  facultyname: { 
    type: String, 
    required: true,
    minlength: [3, 'Faculty name must be at least 3 characters long'],
    maxlength: [100, 'Faculty name must be less than 100 characters']
  },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Administrator', 
    required: true,
    validate: {
      validator: function(v) {
        // Check if the adminId exists in the Administrator collection
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid Admin ID'
    }
  }
});


// Department schema definition
const DepartmentSchema = new mongoose.Schema({
  departmentName: { 
    type: String, 
    required: true,
    minlength: [3, 'Department name must be at least 3 characters long'],
    maxlength: [100, 'Department name must be less than 100 characters']
  },
  facultyID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty', 
    required: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid Faculty ID'
    }
  }
});

// Pre-hook middleware to delete all related majors, instructors, courses, and instructors of the courses before deleting a department
DepartmentSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Delete all majors associated with the department
    const majors = await mongoose.model('Major').find({ departmentId: this._id });
    await mongoose.model('Major').deleteMany({ departmentId: this._id });

    // Delete all instructors related to the majors of the department
    for (const major of majors) {
      // Delete instructors associated with each major
      await mongoose.model('Instructor').deleteMany({ majorid: major._id });
      
      // Delete all courses related to this major
      const courses = await mongoose.model('Course').find({ majorId: major._id });

      // Delete instructors associated with the courses (if any)
      for (const course of courses) {
        await mongoose.model('Instructor').deleteMany({ _id: { $in: course.instructorIds } });
      }

      // Now delete the courses
      await mongoose.model('Course').deleteMany({ majorId: major._id });
    }

    // Proceed with the deletion of the department
    next();
  } catch (error) {
    console.error('Error deleting related majors, instructors, or courses:', error);
    next(error); // Pass error to the next middleware or handler
  }
});

const MajorSchema = new mongoose.Schema({
  majorName: { 
    type: String, 
    required: true, 
    minlength: [3, 'Major name must be at least 3 characters long'],
    maxlength: [100, 'Major name must be less than 100 characters']
  },
  description: { 
    type: String, 
    required: true, 
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description must be less than 500 characters']
  },
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true,
    validate: {
      validator: function(v) {
        // Check if the departmentId exists in the Department collection
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid Department ID'
    }
  }
});
// Define Schemas and Models
const InstructorSchema = new mongoose.Schema({
  firstname: { 
    type: String, 
    required: true, 
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name must be less than 50 characters']
  },
  lastname: { 
    type: String, 
    required: true, 
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name must be less than 50 characters']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^.+@.+\..+$/, 'Please provide a valid email address']
  },
  phonenumber: { 
    type: String, 
    required: true, 
    match: [/^\d{8}$/, 'Phone number must be exactly 8 digits']
  },
  address: { 
    type: String, 
    required: true, 
    maxlength: [200, 'Address must be less than 200 characters']
  },
  hiredate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date(); // Hire date should not be in the future
      },
      message: 'Hire date cannot be in the future'
    }
  },
  dob: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date(); // Date of birth cannot be in the future
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  salary: { 
    type: Number, 
    required: true,
    min: [0, 'Salary must be a positive number']
  },
  image: { 
    type: Buffer, 
    required: true
  },
  cv: { 
    type: Buffer, 
    required: true
  },
  majorid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Major', 
    required: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v); // Check if majorid is a valid ObjectId
      },
      message: 'Invalid Major ID'
    }
  }
});
const CourseSchema = new mongoose.Schema({
  courseName: { 
    type: String, 
    required: true, 
    minlength: [3, 'Course name must be at least 3 characters long'],
    maxlength: [100, 'Course name must be less than 100 characters']
  },
  credits: { 
    type: Number, 
    required: true, 
    min: [1, 'Credits must be between 1 and 6'], 
    max: [6, 'Credits must be between 1 and 6']
  },
  description: { 
    type: String, 
    required: true, 
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description must be less than 500 characters']
  },
  gradeLevel: { 
    type: String, 
    required: true, 
    enum: {
      values: ['First Year', 'Second Year', 'Third Year', 'M1', 'M2'],
      message: '{VALUE} is not a valid grade level'
    }
  },
  semesterNumber: { 
    type: Number, 
    required: true, 
    validate: {
      validator: Number.isInteger, 
      message: '{VALUE} is not an integer'
    }
  },
  courseType: { 
    type: String, 
    required: false, 
    default: "Mandatory",
    enum: ['Mandatory', 'Elective'],  // Added validation for courseType
    message: '{VALUE} is not a valid course type'
  },
  majorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Major', 
    required: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v); // Validates if majorId is a valid ObjectId
      },
      message: 'Invalid Major ID'
    }
  },
  instructorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Instructor', 
    required: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v); // Validates if instructorId is a valid ObjectId
      },
      message: 'Invalid Instructor ID'
    }
  }
});
  

const Administrator = mongoose.model('Administrator', AdminSchema);
const Faculty = mongoose.model('Faculty', FacultySchema);
const Department = mongoose.model('Department', DepartmentSchema);
const Major = mongoose.model('Major', MajorSchema);
const Instructor = mongoose.model("Instructor", InstructorSchema);
const Course = mongoose.model('Course', CourseSchema);

// Routes
// Sign-Up Route for Administrators
app.post('/admin/signup', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingAdmin = await Administrator.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Administrator already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Administrator({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    const savedAdmin = await newAdmin.save();

    res.status(201).json({
      message: 'Administrator created successfully.',
      adminId: savedAdmin._id,
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
    const admin = await Administrator.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: 'Administrator not found.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    res.json({
      message: 'Signed in successfully.',
      adminId: admin._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add Faculty Route
app.post('/faculties', async (req, res) => {
  const { facultyname, adminId } = req.body;

  if (!facultyname || !adminId) {
    return res.status(400).json({ message: 'Faculty name and adminId are required.' });
  }

  try {
    const admin = await Administrator.findById(adminId);

    if (!admin) {
      return res.status(400).json({ message: 'Admin not found.' });
    }

    const newFaculty = new Faculty({ facultyname, adminId });
    const savedFaculty = await newFaculty.save();

    res.status(201).json({
      message: 'Faculty added successfully.',
      facultyId: savedFaculty._id,
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
    const faculties = await Faculty.find({ adminId });

    if (faculties.length === 0) {
      return res.status(404).json({ message: 'No faculties found for this admin.' });
    }

    res.status(200).json({faculties});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add Department
app.post('/departments', async (req, res) => {
  const { departmentName, facultyID } = req.body;

  if (!departmentName || !facultyID) {
    return res.status(400).json({ message: 'Department name and facultyID are required.' });
  }

  try {
    const faculty = await Faculty.findById(facultyID);

    if (!faculty) {
      return res.status(400).json({ message: 'Faculty not found.' });
    }

    const newDepartment = new Department({ departmentName, facultyID });
    const savedDepartment = await newDepartment.save();

    res.status(201).json({
      message: 'Department added successfully.',
      departmentId: savedDepartment._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get Departments by Faculty
app.get('/departments/faculty/:facultyId', async (req, res) => {
  const { facultyId } = req.params;

  try {
    const departments = await Department.find({ facultyID: facultyId });

    if (departments.length === 0) {
      return res.status(404).json({ message: 'No departments found for this faculty.' });
    }

    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add Major
app.post('/majors', async (req, res) => {
  const { majorName, description, departmentId } = req.body;

  if (!majorName || !description || !departmentId) {
    return res.status(400).json({ message: 'Major name, description, and departmentId are required.' });
  }

  try {
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(400).json({ message: 'Department not found.' });
    }

    const newMajor = new Major({ majorName, description, departmentId });
    const savedMajor = await newMajor.save();

    res.status(201).json({
      message: 'Major added successfully.',
      majorId: savedMajor._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get Majors by Department
app.get('/majors/:departmentId', async (req, res) => {
  const { departmentId } = req.params;

  try {
    const majors = await Major.find({ departmentId });

    if (majors.length === 0) {
      return res.status(404).json({ message: 'No majors found for this department.' });
    }

    res.status(200).json(majors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});
// Route to Add New Instructor
app.post(
    "/instructor/add",
    upload.fields([{ name: "image" }, { name: "cv" }]),
    async (req, res) => {
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
  
      // Validate required fields
      if (!firstname || !lastname || !email || !phonenumber || !hiredate || !dob || !salary || !majorid || !req.files.image || !req.files.cv) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      try {
        // Read uploaded files as binary data
        const imageBinary = fs.readFileSync(req.files.image[0].path);
        const cvBinary = fs.readFileSync(req.files.cv[0].path);
  
        // Ensure majorId exists
        const majorExists = await mongoose.model("Major").findById(majorid);
        if (!majorExists) {
          return res.status(400).json({ message: "Invalid majorId. Major not found." });
        }
  
        // Create new instructor
        const newInstructor = new Instructor({
          firstname,
          lastname,
          email,
          phonenumber,
          address,
          hiredate: new Date(hiredate),
          dob: new Date(dob),
          salary: parseFloat(salary),
          image: imageBinary,
          cv: cvBinary,
          majorid,
        });
  
        const savedInstructor = await newInstructor.save();
  
        res.status(201).json({
          message: "Instructor added successfully.",
          instructorId: savedInstructor._id,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
      }
    }
  );
  // Get instructors by major
  app.get("/instructors/:majorId", async (req, res) => {
    const { majorId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(majorId)) {
            return res.status(400).json({ message: "Invalid majorId." });
        }

        const instructors = await Instructor.find({ majorid: majorId });

        if (instructors.length === 0) {
            return res.status(404).json({ message: "No instructors found for this major." });
        }

        // Convert image and CV to Base64 format
        const formattedInstructors = instructors.map(instructor => ({
            ...instructor.toObject(),
            image: instructor.image ? instructor.image.toString("base64") : null,
            cv: instructor.cv ? instructor.cv.toString("base64") : null,
        }));

        res.status(200).json(formattedInstructors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});


// Add Course Route
app.post('/courses/addCourse', async (req, res) => {
  const { courseName, credits, description, gradeLevel, semesterNumber, courseType, majorId, instructorId } = req.body;

  if (!courseName || !credits || !description || !gradeLevel || !majorId || !instructorId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const major = await Major.findById(majorId);
    const instructor = await Instructor.findById(instructorId);

    if (!major) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    if (!instructor) {
      return res.status(400).json({ message: 'Invalid instructorId.' });
    }

    const newCourse = new Course({
      courseName,
      credits,
      description,
      gradeLevel,
      semesterNumber,
      majorId,
      instructorId,
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      message: 'Course added successfully.',
      courseId: savedCourse._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get Courses by MajorId Route with populate
app.get('/courses/major/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    // Find courses related to the majorId and populate related Major details
    const courses = await Course.find({ majorId: majorId })
      .populate('majorId', 'name description'); // Adjust fields as needed

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get courses with specific filters using populate
app.get('/courses/filtered/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    const courses = await Course.find({ 
      majorId: majorId,
      $or: [
        { gradeLevel: { $gt: "First Year" } },
        { credits: { $gte: 3, $lte: 6 } }
      ]
    })
    .populate('majorId', 'name description'); // Populate Major details

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found matching the criteria.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get courses for grade level = "Second Year", semester number between 3 and 4 using populate
app.get('/courses/secondYearSemester/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    const courses = await Course.find({ 
      gradeLevel: "Second Year", 
      semesterNumber: { $gte: 3, $lte: 4 }, 
      majorId: majorId 
    })
    .populate('majorId', 'name description'); // Populate Major details

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found matching the criteria.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get courses for courseType = "Optional" and gradeLevel = "Third Year" using populate
app.get('/courses/optionalThirdYear/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    const courses = await Course.find({ 
      majorId: majorId, 
      courseType: "Optional", 
      gradeLevel: "Third Year" 
    })
    .populate('majorId', 'name description'); // Populate Major details

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No optional third-year courses found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get courses where courseType = "Mandatory" and (credits = 3 OR semesterNumber = 4) using populate
app.get('/courses/mandatoryFiltered/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    // Validate majorId
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    const courses = await Course.find({
      majorId: majorId,
      courseType: "Mandatory",
      $or: [
        { credits: 3 },
        { semesterNumber: 4 }
      ]
    })
    .populate('majorId', 'name description'); // Populate Major details

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No mandatory courses with the specified criteria found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

//instructor average salary
app.get('/instructors/aggregate/salary', async (req, res) => {
  try {
    const aggregationResult = await Instructor.aggregate([
      {
        $lookup: {
          from: "majors", // Join with the "majors" collection
          localField: "majorid", // Field in the "instructors" collection
          foreignField: "_id", // Field in the "majors" collection
          as: "majorDetails", // Name for the joined data
        },
      },
      {
        $unwind: "$majorDetails", // Deconstruct array to get a document for each joined major
      },
      {
        $group: {
          _id: "$majorDetails.majorName", // Group by the name of the major
          averageSalary: { $avg: "$salary" }, // Calculate average salary
          instructorCount: { $sum: 1 }, // Count the number of instructors
        },
      },
      {
        $sort: { averageSalary: -1 }, // Sort by average salary in descending order
      },
    ]);

    res.status(200).json(aggregationResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

app.put('/courses/update/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const { courseName, credits, description, gradeLevel, semesterNumber, courseType, majorId, instructorId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: 'Invalid courseId.' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Validate majorId and instructorId
    if (majorId && !await Major.findById(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }
    if (instructorId && !await Instructor.findById(instructorId)) {
      return res.status(400).json({ message: 'Invalid instructorId.' });
    }

    // Update course details
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { courseName, credits, description, gradeLevel, semesterNumber, courseType, majorId, instructorId },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Course updated successfully.',
      updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route to delete a department
app.delete('/departments/:departmentId', async (req, res) => {
  const { departmentId } = req.params;

  try {
    // Check if the department exists
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    // Delete the department
    await department.deleteOne();

    res.status(200).json({ message: 'Department and associated majors deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

