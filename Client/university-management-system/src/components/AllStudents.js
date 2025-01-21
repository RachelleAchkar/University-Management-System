import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css';
const AllStudents = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // To control modal visibility
  const [showFileNumberInput, setShowFileNumberInput] = useState(false); // To show file number input
  const [fileNumber, setFileNumber] = useState(''); // To store file number
  const [error, setError] = useState(''); // To handle errors for file number
  const location = useLocation();
  const majorId = location.state?.majorId;
  const navigate = useNavigate();
  const [maxFileNumber, setMaxFileNumber] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentActionModal, setStudentActionModal] = useState(false); // Student action modal
  const [selectedStudent, setSelectedStudent] = useState(null); // To store the clicked student
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  

  useEffect(() => {
    // Fetch students when the component loads or when majorId or searchTerm changes
    fetchStudents();
  }, [majorId, searchTerm]); // Ensure fetch is triggered for search or majorId change

  const handleSearchChange = () => {
    setSearchTerm(searchQuery); // Ensure the search term updates
    fetchStudents();  // Fetch with updated search query
};


const handleClearSearch = () => {
    setSearchQuery("");  // Clear search input
    fetchStudents("");   // Pass empty string to reset
};

const fetchStudents = (search = searchQuery) => {
  setLoading(true);
  setStudents([]); // Clear previous students to avoid duplicates

  const url = new URL(`http://localhost:8080/addStudent/major/${majorId}`);
  
  if (search && search.trim() !== "") {
      url.searchParams.append("search", search);
  }

  console.log("Request URL:", url.toString()); // Debugging log

  fetch(url)
      .then((response) => response.json())
      .then((data) => {
          console.log("Fetched students:", data); // Debugging
          setStudents(data); // Overwrite the state, not append
          setLoading(false);
      })
      .catch((error) => {
          console.error("Error fetching students:", error);
          setLoading(false);
      });
};


  const handleAddStudent = () => {
    setShowModal(true); // Show modal when Add Student is clicked
  };

  useEffect(() => {

    fetch('http://localhost:8080/addStudent/maxFileNumber')
      .then((response) => response.json())
      .then((data) => {
        if (data !== null && typeof data === 'number') {
          setMaxFileNumber(data);
        } else {
          setMaxFileNumber(0); // Set to 0 if no students exist
        }
      })
      .catch((error) => {
        console.error('Error fetching max file number:', error);
        setMaxFileNumber(0); // Default to 0 in case of error
      });
  }, []);
     // Function to delete a student
     const handleDeleteStudent = (studentId) => {
      if (window.confirm("Are you sure you want to delete this student?")) {
        fetch(`http://localhost:8080/addStudent/delete/${studentId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
  
        })
          .then((response) => {
            if (response.ok) {
              setStudents(students.filter((student) => student.studentID !== studentId));
            } else {
              console.error("Error deleting student:", response.statusText);
              setError("Failed to delete student. Please try again.");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            setError("An error occurred while deleting the student.");
          });
      }
    };
  

  const handleNewStudent = () => {
    const minFileNumber = 30000; // Ensure compliance with backend validation
    const newFileNumber = maxFileNumber && maxFileNumber >= minFileNumber 
      ? maxFileNumber + 1 
      : minFileNumber; // Start from 30000 if no file number exists
    navigate('/addStudent', { state: { isNew: true, fileNumber: newFileNumber, majorId } });
  };


  const handleOldStudent = () => {
    setShowFileNumberInput(true);
  };

  const handleSubmitFileNumber = async () => {
    try {

      const response = await fetch(`http://localhost:8080/addStudent/info/${fileNumber}`);

      if (response.ok) {
        const studentData = await response.json();
        console.log('Fetched studentData:', studentData);
        navigate('/addStudent', { state: { fileNumber, majorId, isNew: false, studentData } });
      } else {
        console.error('Error fetching studentData:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  
  const closeModal = () => {
    setShowModal(false);
    setShowFileNumberInput(false);
    setFileNumber('');
    setError('');
  };



  const handleStudentClick = (student) => {
    console.log(student);  // Debugging to check the student data
    setSelectedStudent(student);
    setStudentActionModal(true);
  };
  const handleBackToMajorDetails = () => {
    navigate('/majordetails', { state: { majorId } });
  };


  const handleAddGrade = () => {
    if (selectedStudent && selectedStudent.studentID) { // Ensure selectedStudent and studentID are available
      navigate('/addGrade', { state: { student: selectedStudent, studentId: selectedStudent.studentID } });
    } else {
      console.error("Selected student or studentId is missing");
    }
  };
  
  

  const handleShowTranscript = () => {
    // Pass studentId along with student data when navigating to "Show Transcript"
    if (selectedStudent && selectedStudent.studentID) { // Ensure selectedStudent and studentID are available
    navigate('/showTranscript', { state: { student: selectedStudent, studentId: selectedStudent.studentId } });
  } else {
    console.error("Selected student or studentId is missing");
  }
  };

  const closeModals = () => {
    setShowModal(false);
    setStudentActionModal(false);
    setSelectedStudent(null);

  };
  
 // Disable background scrolling when modal is open
 useEffect(() => {
  if (showModal) {
    document.body.style.overflow = 'hidden'; // Disable scrolling
  } else {
    document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
  }

  // Clean up on unmount or modal close
  return () => {
    document.body.style.overflow = ''; // Re-enable scrolling
  };
}, [showModal]);

  return  (
   
       <div className="faculties-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={handleBackToMajorDetails}
        title="Back to Major Details"
      >
        🢀
      </button>
      <h1>Students</h1>
      <div className="search-container">
  <input
    type="text"
    placeholder="Search by file number"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="search-input"  // Add the class name here
  />
  <button className="search-button" onClick={handleSearchChange}>🔍 Search</button> 
  <button className="clear-button" onClick={handleClearSearch}>❌ Clear</button> 
</div>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div className="faculties-list">
          {students.map((student) => (
            <div
              key={student.fileNumber}
              className="faculty-box"
              onClick={() => handleStudentClick(student)}
            >
              <div className='course-detail'> <span className="label">File Number:</span> <span>{student.fileNumber}</span></div>
              <div className='course-detail'> <span className="label">Name:</span> <span>{student.firstName} {student.lastName}</span></div>
              <div className='course-detail'> <span className="label">Year:</span> <span>{student.year}</span></div>
              <div className='course-detail'> <span className="label">Date of birth:</span> <span>{student.dob}</span></div>
              <div className='course-detail'> <span className="label">Email:</span> <span>{student.email}</span></div>
              <div className='course-detail'> <span className="label">Phone Number:</span> <span>{student.phoneNumber}</span></div>
              <div className='course-detail'> <span className="label">Address:</span> <span>{student.address}</span></div>
              <div className='course-detail'> <span className="label">Registration Date:</span> <span>{student.registrationDate}</span></div>
              <div className='course-detail'> <span className="label">Status:</span> <span>{student.status}</span></div>
                {/* Delete Button */}
                <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent click event
                  handleDeleteStudent(student.studentID);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      <button className="add-faculty-button" onClick={handleAddStudent}>
        Add Student
      </button>
      {studentActionModal && selectedStudent && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Actions for {selectedStudent.firstName} {selectedStudent.lastName}</h3>
      <button className="modal-button" onClick={handleAddGrade}>Add Grade</button>
      <button className="modal-button" onClick={handleShowTranscript}>Show Transcript</button>
      <button className="modal-close-button" onClick={closeModals}>Cancel</button>
    </div>
  </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Select Student Type</h3>
            {!showFileNumberInput ? (
              <>
                <button className="modal-button" onClick={handleNewStudent}>
                  New Student
                </button>
                <button className="modal-button" onClick={handleOldStudent}>
                  Old Student
                </button>
                <button className="modal-close-button" onClick={closeModal}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h4>Enter File Number</h4>
                <input
                  type="text"
                  value={fileNumber}
                  onChange={(e) => setFileNumber(e.target.value)}
                  placeholder="File Number"
                  className="file-number-input"
                />
                {error && <p className="error-text">{error}</p>}
                <button className="modal-button" onClick={handleSubmitFileNumber}>
                  Submit
                </button>
                <button className="modal-close-button" onClick={closeModal}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 80%;
    max-width: 500px;
  }
  
  .modal h2 {
    font-size: 24px;
    color: #456aae;
    margin-bottom: 15px;
  }

  .modal-button {
    margin: 10px;
    padding: 12px 25px;
    background-color: #191361;
    color: white;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .modal-button:hover {
    background-color: #5d45a0;
  }

  .modal-close-button {
    margin-top: 15px;
    color:rgb(165, 56, 44);
    font-size: 16px;
    cursor: pointer;
    border: none;
    background: none;
  }
  .modal-close-button:hover {
    margin-top: 15px;
    color:rgb(255, 255, 255);
    font-size: 16px;
    cursor: pointer;
    border: none;
    background: rgb(165, 56, 44);
  }
  .file-number-input {
    margin-top: 15px;
    padding: 12px;
    width: 80%;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }

  .error-text {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 5px;
  }
`}</style>

    </div>
  );
};

export default AllStudents;