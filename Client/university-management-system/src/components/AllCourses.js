import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css'; 

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); 
  const navigate = useNavigate();
  const majorId = location.state?.majorId 

 useEffect (() => {
    const fetchCourses = async () => {
        try{
            const response = await fetch(`http://localhost:8080/courses/${majorId}`);
            if(response.ok){
                const data = await response.json();
                setCourses(data);
                

            }else{
                setCourses([]); //No content or error
            }

        }catch(error){
            console.error('Error fetching courses:', error);
        }finally{
            setLoading(false);
        }

    };
    fetchCourses();
 }, [majorId]);

 if (loading) {
    return <p>Loading...</p>;
  }

  const handleAddCourseClick = () => {
    navigate('/addCourse', { state: { majorId } });
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
      <h1>Courses</h1>
      {courses.length === 0 ? (
        <p>No courses found for this major.</p>
      ) : (
        <div className="faculties-list">
          {courses.map((course) => (
            
  <div
    key={course.courseId} // Assuming courseId is the unique identifier
    className="faculty-box"
  >
    <h3>{course.courseName}</h3>
    <div className="course-details">
      <div className="course-detail">
        <span className="label">Credits:</span> <span>{course.credits}</span>
      </div>
      <div className="course-detail">
        <span className="label">Description:</span> <span>{course.description}</span>
      </div>
      <div className="course-detail">
        <span className="label">Grade Level:</span> <span>{course.gradeLevel}</span>
      </div>


    </div>
  </div>
))}

        </div>
      )}

      <button className="add-faculty-button" onClick={handleAddCourseClick}>
        Add Course
      </button>
    </div>
  );
};

export default AllCourses;