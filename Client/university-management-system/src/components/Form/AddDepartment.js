import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Forms.css';

const AddDepartment = ({ onDepartmentAdded }) => {
  const [departmentName, setDepartmentName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const facultyId = location.state?.facultyId;

  useEffect(() => {
    console.log("Received facultyId in AddDepartment:", facultyId);
  }, [facultyId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!facultyId) {
      alert('Faculty ID is missing!');
      return;
    }

    const departmentData = {
      departmentName,
      facultyID: facultyId, // Sending faculty reference
    };

    fetch('http://localhost:8080/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          // If validation errors exist, display them as alerts
          if (data && data.message) {
            alert(`Error: ${data.message}`);  // If there's a custom error message from backend
          } else if (data) {
            let errorMessage = 'Validation errors:\n';
            Object.keys(data).forEach((key) => {
              errorMessage += `${key}: ${data[key]}\n`;
            });
            alert(errorMessage);  // Show all errors as a single alert
          } else {
            alert('Failed to add department');
          }
          return;  // Stop further execution
        }

        const data = await response.json();
        alert('Department added successfully!');
        console.log('Added department:', data); 
        setDepartmentName(''); // Clear the input field
        if (onDepartmentAdded) onDepartmentAdded(data); // Notify parent of the addition
        navigate('/departments', { state: { facultyId } });
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Failed to add department');
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
              required
              placeholder="Department Name"
            />
          </div>
          <button type="submit" className="formButton">
            Add Department
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
