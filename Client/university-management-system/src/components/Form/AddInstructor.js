import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AddStudent.css';
import { useNavigate } from 'react-router-dom';
const AddInstructor = () => {
  const location = useLocation();
  const majorId = location.state?.majorId;
  console.log("Received majorId in AddInstructor:", majorId);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phoneNumber: '',
    address: '',
    hireDate: '',
    salary: '',
    majorId: majorId || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  
    fetch('http://localhost:8081/addInstructor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(async (response) => {
        if (response.ok) {
          alert('Instructor added successfully!');
          navigate('/allInstructors', { state: { majorId } });
        } else {
          const errorMessage = await response.text();
          alert(`Validation Error:\n${errorMessage}`);
        }
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  };
  
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add Instructor</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputContainer1">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="hireDate">Hire Date</label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="salary">Salary</label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
        
          <button type="submit" className="formButton">
            Add Instructor
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInstructor;
