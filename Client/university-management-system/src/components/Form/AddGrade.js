import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Forms.css';
const AddGrade = ({ onGradeSubmit, onClose }) => {
  const [selectedCourse, setSelectedCourse] = useState(null); 
  const [grade, setGrade] = useState(''); 
  const [courses, setCourses] = useState([]);
  const location = useLocation();
  const student = location.state?.student;
  const studentId = location.state?.studentId;

  // Fetch courses for the student
  useEffect(() => {
    const fetchCourses = async () => {
      if (!studentId) {
        console.error('Student ID is missing or incorrect');
        return;
      }

      try {
        // Try to fetch from localStorage first
        const storedCourses = localStorage.getItem(`courses_${studentId}`);
        if (storedCourses) {
          setCourses(JSON.parse(storedCourses)); // Use stored data if available
        } else {
          // Fetch from the backend if not in localStorage
          const response = await fetch(`http://localhost:8081/enrollment/${studentId}`);
          if (response.ok) {
            const data = await response.json();
            setCourses(data); 
            localStorage.setItem(`courses_${studentId}`, JSON.stringify(data)); // Store in localStorage
          } else {
            console.error('Failed to fetch courses');
            setCourses([]);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [studentId]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setGrade('');
  };

  const handleGradeSubmit = async () => {
    if (!grade || isNaN(grade) || grade < 0 || grade > 100) {
      alert('Please enter a valid grade between 0 and 100.');
      return;
    }

    try {
      // Create a new grade object
      const updatedCourses = courses.map((course) => {
        if (course.courseID === selectedCourse.courseID) {
          return { ...course, grade: parseFloat(grade) }; // Update the grade for the selected course
        }
        return course;
      });

      // Update localStorage with the new course data
      localStorage.setItem(`courses_${studentId}`, JSON.stringify(updatedCourses));

      // Update the local state
      setCourses(updatedCourses);

      // call an API to save the grade on the backend
      const gradeUpdatePayload = [
        {
          studentId: studentId,
          courseId: selectedCourse.courseID,
          grade: parseFloat(grade), // Use parseFloat to allow decimal grades
        },
      ];

      const response = await fetch(`http://localhost:8081/enrollment/updateEnrollmentGrade/${selectedCourse.courseID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeUpdatePayload),
      });

      if (response.ok) {
        alert(`Grade for ${selectedCourse.courseName} updated successfully!`);
        setSelectedCourse(null); // Close the popup
      } else {
        alert('Failed to update grade. Please try again.');
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      alert('An error occurred while updating the grade.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>
          Grades for {student?.firstname} {student?.lastname}
        </h3>
        <div className="course-boxes">
          {courses.length === 0 ? (
            <p>No courses found for this student.</p>
          ) : (
            courses.map((course) => (
              <div
                key={course.courseID}
                className="course-box"
                onClick={() => handleCourseClick(course)}
              >
                <p>{course.courseName}</p>
                {course.grade !== undefined && <p>Grade: {course.grade}</p>}
              </div>
            ))
          )}
        </div>
       
      </div>

      {/* Grade Input Popup */}
      {selectedCourse && (
        <div className="score-popup">
          <div className="score-popup-content">
            <h4>Add Grade for {selectedCourse.courseName}</h4>
            <input
              type="number"
              placeholder="Enter Grade (0-100)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <button onClick={handleGradeSubmit}>Submit Grade</button>
            <button onClick={() => setSelectedCourse(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGrade;