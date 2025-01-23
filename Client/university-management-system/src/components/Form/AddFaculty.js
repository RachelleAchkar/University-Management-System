import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Forms.css';

const AddFaculty = () => {
  const [facultyname, setFacultyName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const adminId = localStorage.getItem('adminId'); 
  
    if (!adminId) {
      alert('Admin ID not found in local storage');
      return;
    }
  
    const facultyData = {
      facultyname,
      adminId, 
    };
  
    fetch('http://localhost:8081/faculties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facultyData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            // Check if it's a validation error
            if (data.facultyname) {
              // Display validation error alert
              alert(data.facultyname);  // This will show the error in an alert
            } else if (data.message) {
              alert(data.message);  // If any other message from backend
            } else {
              // Handle other types of errors
              alert('Failed to add faculty');
            }
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.message) {
          alert(data.message); // Display the success message from backend
        }
        setFacultyName(''); // Clear the input field
        navigate('/faculties'); 
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add New Faculty</h2>

        <form onSubmit={handleSubmit}>
          <div className="inputContainer">
            <input
              type="text"
              className="inputField"
              placeholder="Faculty Name"
              value={facultyname}
              onChange={(e) => setFacultyName(e.target.value)}
            />
          </div>
          <button type="submit" className="formButton">
            Add Faculty
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFaculty;