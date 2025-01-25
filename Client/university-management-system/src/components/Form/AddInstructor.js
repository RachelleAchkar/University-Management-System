import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddStudent.css';

const AddInstructor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const majorId = location.state?.majorId || ''; // Major ID passed via navigation state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    dob: '',
    email: '',
    phonenumber: '',
    address: '',
    hiredate: '',
    salary: '',
    image: null, // For image file upload
    cv: null, // For CV file upload
    majorid: majorId,
  });
  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    // Validate fields before submission
    if (!formData.majorid) {
      alert('Major ID is required. Please navigate from a valid major context.');
      return;
    }
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await fetch('http://localhost:8081/instructor/add', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Instructor added successfully!');
        navigate('/allInstructors', { state: { majorId } });
      } else {
        const error = await response.json();
        setErrors(error);
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add Instructor</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="inputContainer1">
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
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
            <label htmlFor="phonenumber">Phone Number</label>
            <input
              type="tel"
              id="phonenumber"
              name="phonenumber"
              value={formData.phonenumber}
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
            <label htmlFor="hiredate">Hire Date</label>
            <input
              type="date"
              id="hiredate"
              name="hiredate"
              value={formData.hiredate}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="salary">Salary</label>
            <input
              type="number"
              step="0.01"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="cv">Upload CV (PDF)</label>
            <input
              type="file"
              id="cv"
              name="cv"
              accept="application/pdf"
              onChange={handleFileChange}
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

