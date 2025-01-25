import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css';


const AllInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const majorId = location.state?.majorId;

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(`http://localhost:8081/instructors/${majorId}`);
        if (response.ok) {
          const data = await response.json();
          setInstructors(data);
        } else {
          setInstructors([]); // No content or error
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, [majorId]);

  const handleAddInstructorClick = () => {
    navigate('/addInstructor', { state: { majorId } });
  };

  const handleBackToMajorDetails = () => {
    navigate('/majordetails', { state: { majorId } });
  };

  if (!majorId) {
    return <p>Major not found. Please go back and select a major.</p>;
  }

  if (loading) {
    return <p>Loading instructors...</p>;
  }

  return (
    <div className="faculties-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={handleBackToMajorDetails}
        title="Back to Major Details"
      >
        🢀
      </button>

      <h1>Instructors</h1>

      {instructors.length === 0 ? (
        <p>No instructors found for this major.</p>
      ) : (
        <div className="faculties-list">
          {instructors.map((instructor) => (
            <div
              key={instructor._id} // Use the instructor's _id from MongoDB
              className="faculty-box"
            >
              {/* Display Image */}
              {instructor.image && (
                <div className="instructor-image">
                  <img
                    src={`data:image/${instructor.imageFormat};base64,${instructor.image.toString('base64')}`}
                    alt={`${instructor.firstname} ${instructor.lastname}`}
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              )}
              <h3>{instructor.firstname} {instructor.lastname}</h3>
              <div className="course-details">
                <div className="course-detail">
                  <span className="label">Date of Birth:</span> <span>{formatDate(instructor.dob)}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Email:</span> <span>{instructor.email}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Phone Number:</span> <span>{instructor.phonenumber}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Address:</span> <span>{instructor.address}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Hire Date:</span> <span>{formatDate(instructor.hiredate)}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Salary:</span> <span>{instructor.salary} $</span>
                </div>
              

                
                {/* Display CV */}
                {instructor.cv && (
                  <div className="course-detail">
                    <span className="label">CV:</span>
                    <a
                      href={`data:application/pdf;base64,${instructor.cv.toString('base64')}`}
                      download={`${instructor.firstname}_${instructor.lastname}_CV.pdf`}
                    >
                      Download CV
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Instructor Button */}
      <button className="add-faculty-button" onClick={handleAddInstructorClick}>
        Add Instructor
      </button>
    </div>
  );
};

export default AllInstructors;
