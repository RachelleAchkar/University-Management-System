import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Forms.css';

const AddDepartment = () => {
  const [departmentName, setDepartmentName] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const facultyId = location.state?.facultyId; // Get the faculty ID from the previous page

  useEffect(() => {
    if (!facultyId) {
      alert('Faculty ID is missing! Redirecting...');
      navigate('/faculties'); // Redirect if facultyId is missing
    }
  }, [facultyId, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!departmentName.trim()) {
      alert('Department name is required.');
      return;
    }
  
    if (!facultyId) {
      alert('Faculty ID is missing!');
      return;
    }
  
    const departmentData = {
      departmentName,
      facultyID: facultyId, // Sending faculty reference
    };
  
    fetch('http://localhost:8081/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    })
      .then(async (response) => {
        const data = await response.json();
  
        if (!response.ok) {
          // Handle validation or server errors
          alert(data.message || 'Failed to add department.');
          return;
        }
  
        // Success case
        alert('Department added successfully!');
        setDepartmentName(''); // Clear the input field
        navigate('/departments', { state: { facultyId } }); // Redirect to the department list
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Failed to add department. Please try again later.');
      });
  };
  

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add A Department</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputContainer">
            <input
              className="inputField"
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Department Name"
            />
          </div>
          {error && <p className="errorText">{error}</p>}
          <button type="submit" className="formButton">
            Add Department
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
