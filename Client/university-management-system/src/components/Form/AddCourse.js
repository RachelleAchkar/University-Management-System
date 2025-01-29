import React, { useState, useEffect } from 'react';
import './Forms.css';
import { useLocation, useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const location = useLocation();
  const { course, majorId } = location.state || {};  // Retrieve course data and majorId

  const navigate = useNavigate();

  // Initialize form data with default values or existing course data
  const [formData, setFormData] = useState({
    courseId: course ? course._id : '',  // Use _id from course, not courseId
    courseName: course ? course.courseName : '',
    credits: course ? String(course.credits) : '',
    description: course ? course.description : '',
    gradeLevel: course ? course.gradeLevel : '',
    semesterNumber: course ? String(course.semesterNumber) : '',
    majorId: majorId || '',
    instructorId: course ? course.instructorId : '',
    courseType: course ? course.courseType : '',
  });
  

  useEffect(() => {
    console.log('Course from location.state:', course);
    // Make sure courseId is properly set
    setFormData({
      courseId: course ? course.courseId : '',  // Default to empty string if no course
      courseName: course ? course.courseName : '',
      credits: course ? String(course.credits) : '',
      description: course ? course.description : '',
      gradeLevel: course ? course.gradeLevel : '',
      semesterNumber: course ? String(course.semesterNumber) : '',
      majorId: majorId || '',
      instructorId: course ? course.instructorId : '',
      courseType: course ? course.courseType : '',
    });
  }, [course, majorId]);

  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    if (majorId) {
      fetch(`http://localhost:8081/instructors/${majorId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) setInstructors(data);
          else alert('No instructors found for this major.');
        })
        .catch((error) => console.error('Error fetching instructors:', error));
    }
  }, [majorId]);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If updating an existing course, check if course._id exists
    if (course && !course._id) {
      console.error("Course ID is missing");
      alert("Course ID is required.");
      return;
    }
  
    console.log("courseId:", course ? course._id : 'Not applicable for new course');
    console.log("majorId:", majorId);
    console.log("instructorId:", formData.instructorId);
  
    // URL and method based on whether it's an update or add
    const url = course ? `http://localhost:8081/courses/update/${course._id}` : 'http://localhost:8081/courses/addCourse';
    const method = course ? 'PUT' : 'POST';
  
    // Make the request to either add or update the course
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(async (response) => {
      if (response.ok) {
        alert(course ? 'Course updated successfully!' : 'Course added successfully!');
        navigate('/allCourses', { state: { majorId } });
      } else {
        const data = await response.json();
        alert(data.message || 'Error processing the course.');
      }
    })
    .catch((error) => console.error('Error:', error));
  };
  

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">{course ? 'Update Course' : 'Add Course'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputContainer">
            <input
              className="inputField"
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="Course Name"
            />
          </div>
          <div className="inputContainer">
            <p>Semester Number</p>
            <input
              className="inputField"
              type="number"
              name="semesterNumber"
              value={formData.semesterNumber}
              onChange={handleChange}
              placeholder="Semester Number"
            />
          </div>
          <div className="inputContainer">
            <p>Select Credits</p>
            <div className="radioGroup">
              {[1, 2, 3, 4, 5, 6].map((credit) => (
                <label key={credit} className="radioLabel">
                  <input
                    type="radio"
                    name="credits"
                    value={credit}
                    checked={String(formData.credits) === String(credit)}
                    onChange={handleChange}
                  />
                  {credit}
                </label>
              ))}
            </div>
          </div>
          <div className="inputContainer">
            <textarea
              className="inputField textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Course Description"
            ></textarea>
          </div>
          <div className="inputContainer">
            <input
              className="inputField"
              type="text"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleChange}
              placeholder="Grade Level"
            />
          </div>
          <div className="inputContainer">
            <p>Select Instructor</p>
            <select
              className="inputField"
              name="instructorId"
              value={formData.instructorId}
              onChange={handleChange}
            >
              <option value="">Select Instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.firstname} {instructor.lastname}
                </option>
              ))}
            </select>
          </div>
          <div className="inputContainer">
            <p>Select Course Type</p>
            <select
              className="inputField"
              name="courseType"
              value={formData.courseType}
              onChange={handleChange}
            >
              <option value="">Select Course Type</option>
              <option value="Mandatory">Mandatory</option>
              <option value="Optional">Optional</option>
            </select>
          </div>
          <button type="submit" className="formButton">
            {course ? 'Update Course' : 'Add Course'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
