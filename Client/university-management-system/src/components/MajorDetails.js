import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MajorDetails.css';

const MajorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const majorId = location.state?.majorId;
  
  console.log("Received majorId:", majorId);

  if (!majorId) {
    return <p>Major not found. Please go back and select a major.</p>;
  }

  const handleAddCourseClick = () => {
    navigate(`/courses/${majorId}`, { state: { majorId } });
  };

  const handleAddInstructorClick = () => {
    navigate(`/instructors/${majorId}`, { state: { majorId } });
};


  const handleAddStudentClick = () => {
    navigate('/allStudents', { state: { majorId } });
  };

  return (
    <div className="major-details-container">
      <h1>Major Details</h1>
      <div className="buttons-container">
        <button className="details-button" onClick={handleAddInstructorClick}>
          Instructors
        </button>

        <button className="details-button" onClick={handleAddCourseClick}>
          Courses
        </button>

        <button className="details-button" onClick={handleAddStudentClick}>
          Students
        </button>
      </div>
    </div>
  );
};

export default MajorDetails;
