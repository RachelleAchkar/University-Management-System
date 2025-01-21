import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddStudent.css';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phoneNumber: '',
    address: '',
    registrationDate: '',
    status: '',
    year: '',
    fileNumber: '',
  });
  const location = useLocation();
  const navigate = useNavigate();
  const majorId = location.state?.majorId; // Retrieve majorId from state
  const { studentData, isNew, fileNumber } = location.state || {};
  useEffect(() => {
    console.log("Received majorId in AddStudent:", majorId);
  }, [majorId]);

  useEffect(() => {
    if (studentData && !isNew) {
      setFormData({ ...studentData, year: '' }); // Pre-fill data except for 'year'
    }
  }, [studentData, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!majorId) {
      alert('Major ID is missing!');
      return;
    }

    const studentData = { ...formData, majorId, fileNumber }; // Include majorId in the payload

    try {
      const response = await fetch('http://localhost:8080/addStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        alert(errorText);  // Show backend validation errors
        throw new Error(errorText); // Stop execution
      }
  
      const data = await response.json();
      if (!data || !data.studentID) {
        alert("Student was not added. Please try again.");
        return;
      }
  
      alert('Student added successfully!');
      console.log('Added Student:', data);
      navigate('/AllStudents', { state: { majorId } });
  
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add Student</h2>
        <form onSubmit={handleSubmit}>
      <h2>{isNew ? 'New Student' : 'Edit Student Details'}</h2>
          <div className="inputContainer">
            <p>First Name</p>
            <input
              className="inputField"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="First Name"
            />
          </div>
          <div className="inputContainer">
            <p>Last Name</p>
            <input
              className="inputField"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Last Name"
            />
          </div>
          <div className="inputContainer">
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
          <div className="inputContainer">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="inputField"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputContainer">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              className="inputField"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputContainer">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              className="inputField"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputContainer">
            <label htmlFor="registrationDate">Registration Date</label>
            <input
              type="date"
              id="registrationDate"
              name="registrationDate"
              className="inputField"
              value={formData.registrationDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputContainer">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="inputContainer">
            <label htmlFor="year">Year</label>
            <input
              type="text"
              id="year"
              name="year"
              className="inputField"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="formButton">
            Add Student
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;