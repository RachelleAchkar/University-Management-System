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
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const FacultySchema = new mongoose.Schema({
  facultyname: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrator', required: true },
});

const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  facultyID: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
});

const MajorSchema = new mongoose.Schema({
  majorName: { type: String, required: true },
  description: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
});
// Define Schemas and Models
const InstructorSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^.+@.+\..+$/ },
    phonenumber: { type: String, required: true },
    address: { type: String },
    hiredate: { type: Date, required: true },
    dob: { type: Date, required: true },
    salary: { type: Number, required: true },
    image: { type: Buffer, required: true },
    cv: { type: Buffer, required: true },
    majorid: { type: mongoose.Schema.Types.ObjectId, ref: "Major", required: true },
  });
  const CourseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    credits: { type: Number, required: true, min: 1, max: 6 },
    description: { type: String, required: true },
    gradeLevel: { type: String, required: true, enum: ['First Year','Second Year','Third Year','M1','M2'] },
    semesterNumber: { type: Number, required: true, validate:{validator: Number.isInteger, message:'{VALUE} is not an integer'}},
    courseType: { type: String, required: false , default: "Mandatory" },
    majorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Major', required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
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

//get courses by majorId
app.get('/courses/major/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(majorId)) {
      return res.status(400).json({ message: 'Invalid majorId.' });
    }

    const courses = await Course.find({ majorId })
      .populate('majorId', 'name') // Populate major details
      .populate('instructorId', 'name department') // Populate instructor details
      .exec();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

//Get Courses with Filtered Criteria (Grade Level > 1 or Credits Between 3 and 6)
app.get('/courses/filtered/:majorId', async (req, res) => {
  try {
    const query = [
      {
        $match: {
          $or: [
            { gradeLevel: { $gt: "First Year" } },
            { credits: { $gte: 3, $lte: 6 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'majors',
          localField: 'majorId',
          foreignField: '_id',
          as: 'major'
        }
      },
      {
        $lookup: {
          from: 'instructors',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructor'
        }
      },
    ];

    const courses = await Course.aggregate(query);

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found matching the criteria.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});
//Get Courses for "Second Year" and Semester Number > 2
app.get('/courses/secondYearSemester/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    const courses = await Course.find({
      gradeLevel: 'Second Year',
      semesterNumber: { $gt: 2 },
      majorId,
    }).populate('majorId', 'name').populate('instructorId', 'name department').exec();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found matching the criteria.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get Optional Third-Year Courses
app.get('/courses/optionalThirdYear/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    const courses = await Course.find({
      majorId,
      courseType: 'Optional',
      gradeLevel: 'Third Year',
    }).populate('majorId', 'name').populate('instructorId', 'name department').exec();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No optional third-year courses found for this major.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});
// Get Mandatory Courses Filtered by Credits or Semester
app.get('/courses/mandatoryFiltered/:majorId', async (req, res) => {
  const { majorId } = req.params;

  try {
    const courses = await Course.find({
      majorId,
      courseType: 'Mandatory',
      $or: [
        { credits: 3 },
        { semesterNumber: 4 }
      ]
    }).populate('majorId', 'name').populate('instructorId', 'name department').exec();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No mandatory courses found matching the criteria.' });
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

