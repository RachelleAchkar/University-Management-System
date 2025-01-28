import React, { useState, useEffect } from 'react';
import './Forms.css';
import { useLocation, useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const location = useLocation();
  const majorId = location.state?.majorId;
  console.log('Received majorId in AddCourse:', majorId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseName: '',
    credits: '',
    description: '',
    gradeLevel: '',
    semesterNumber: '',
    majorId: majorId || '',
    instructorId: '',
    courseType: '',  // Changed from classType to courseType
  });

  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    // Fetch instructors by majorId when the component mounts
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8081/courses/addCourse', {
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
          alert(data.message || 'Error adding course.');
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

          {/* Changed classType to courseType */}
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
            Add Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
