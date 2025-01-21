import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MajorDetails.css';

const Transcript = () => {
  const [enrollments, setEnrollments] = useState([]); 
  const [totalGrade, setTotalGrade] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract student information from the location state
  const student = location.state?.student;
  const studentId = student?.studentID;
  const gradeLevel = student?.gradeLevel;
 
  useEffect(() => {
    if (!studentId) {
      console.error('Student ID is missing or incorrect');
      navigate('/error');
      return;
    }
    
    // fetch enrollments for the student
    const fetchEnrollments = async () => {
      try {
        // fetch enrollments for a specific student
        const response = await fetch(`http://localhost:8080/enrollment/transcript/${studentId}/${gradeLevel}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched enrollments:', data); 
          setEnrollments(data); 
          calculateTotal(data); 
        } else {
          console.error('Failed to fetch enrollments');
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      }
    };

    fetchEnrollments();
  }, [studentId, navigate]);
  
  // Function to calculate total grade and total credits earned (only for passing courses)
  const calculateTotal = (enrollments) => {
    let totalGradePoints = 0;
    let totalCreditsEarned = 0;
    
    // Loop through all enrollments and calculate total grade points and credits for passing courses
    enrollments.forEach((enrollment) => {
      if (enrollment.grade && !isNaN(enrollment.grade)) {
        if (enrollment.grade >= 50) { // Include only passing grades for credit calculation
          totalGradePoints += enrollment.grade * enrollment.credits; // Total grade points
          totalCreditsEarned += enrollment.credits; // Total credits earned
        }
      }
    });
    
    // Calculate total grade (GPA) if there are credits earned
    if (totalCreditsEarned > 0) {
      setTotalGrade(totalGradePoints / totalCreditsEarned); // GPA calculation
    } else {
      setTotalGrade(0); // Set total grade to 0 if no credits are earned
    }
    
    // Update total credits state
    setTotalCredits(totalCreditsEarned);
  };
  
  // Function to get Pass/Fail status based on the grade
  const getPassFailStatus = (grade) => {
    return grade >= 50 ? <span className="pass">Pass</span> : <span className="fail">Fail</span>;
  };
  
  // Function to determine academic status based on the grade
  const getAcademicStatus = (grade) => {
    if (grade >= 90) {
      return <span className="excellent">Excellent</span>;
    }
    if (grade >= 75) {
      return <span className="satisfactory">Satisfactory</span>;
    }
    if (grade >= 60) {
      return <span className="pass1">Pass</span>;
    }
    if (grade >= 50) {
      return <span className="fair">Fair</span>;
    }
    return <span className="fail">Fail</span>;
  };
  
  return (
    <div className="transcript">
      <h3>Transcript for {student?.firstName} {student?.lastName}</h3>
      <table>
        <thead>
          <tr>
           
            <th>Course Name</th>
            <th>Grade</th>
            <th>Pass/Fail Status</th>
            <th>Academic Status</th>
            <th>Credits Earned</th>
            <th>Grade Level</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.length === 0 ? (
            <tr><td colSpan="6">No enrollments found for this student.</td></tr>
          ) : (
            // Map through enrollments to display course details
            enrollments.map((enrollment) => (
              <tr key={enrollment.courseId}>
                <td>{enrollment.courseName}</td>
                {/* Display score and grade, or 'No grade available' if not available */}
                <td>{enrollment.score ?  `${enrollment.score} (${enrollment.grade})` : 'No grade available'}</td>
                <td>{getPassFailStatus(enrollment.grade)}</td>
                <td>{getAcademicStatus(enrollment.grade)}</td>
                {/* Show 0 credits for failed courses */}
                <td>{enrollment.grade >= 50 ? enrollment.credits : '0 (Failed)'}</td>
                <td>{enrollment.gradeLevel}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="totals">
        <h4>Total Credits Earned: {totalCredits}</h4>
        <h4>Total Grade: {totalGrade.toFixed(2)}</h4>
      </div>
    </div>
  );
};

export default Transcript;