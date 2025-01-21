import React, { useState, useEffect } from 'react';
import './Forms.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const location = useLocation();
  const majorId = location.state?.majorId;
  console.log("Received majorId in AddCourse:", majorId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseName: '',
    credits: '',
    description: '',
    gradeLevel: '',
    semesterNumber: '',
    majorId: majorId || '',
    instructorId: '', 
  });

  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    // Fetch instructors by majorId when the component mounts
    if (majorId) {
      fetch(`http://localhost:8080/instructors/${majorId}`)
        .then(response => response.json())
        .then(data => {
          setInstructors(data);
        })
        .catch(error => console.error('Error fetching instructors:', error));
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


  const handleInstructorChange = (e) => {
    const selectedInstructorId = e.target.value;
    console.log("Selected instructorId:", selectedInstructorId); 
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        instructorId: selectedInstructorId,
      };
      console.log("Updated form data:", updatedData); 
      return updatedData;
    });
  };
  
  

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/courses/addCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(async (response) => {
        if (response.ok) {
          alert('Course added successfully!');
          navigate('/allCourses', { state: { majorId } });
        } else {
          const data = await response.json();
          if (data) {
            // Handle validation errors from the backend and display them as alerts
            let errorMessage = 'Validation errors:\n';
            Object.keys(data).forEach((key) => {
              errorMessage += `${key}: ${data[key]}\n`;
            });
            alert(errorMessage);  // Show all errors as a single alert
          } else {
            alert('Error adding course');
          }
        }
      })
      .catch((error) => console.error('Error:', error));
  };


  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add Course</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputContainer">
            <input
              className="inputField"
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
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
              required
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
                    required
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
              required
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
              required
              placeholder="1st Year, 2nd Year, 3rd Year, M1, or M2(1st)"
            />
          </div>

          <div className="inputContainer">
            <p>Select Instructor</p>
            <div className="radioGroup">
              {instructors.length > 0 ? (
                instructors.map((instructor) => (
                  <label key={instructor.instructorID} className="radioLabel">
                    <input
                      type="radio"
                      name="instructorId"
                      value={instructor.instructorID}
                      checked={String(formData.instructorId) === String(instructor.instructorID)}
                      onChange={handleInstructorChange}
                      required
                    />
                    {instructor.firstName} {instructor.lastName} 
                  </label>
                ))
              ) : (
                <p>No instructors available for this major</p> 
              )}
            </div>
          </div>
          <button type="submit" className="formButton">
            Add Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
