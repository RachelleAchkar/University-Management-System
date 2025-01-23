import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Forms.css';

const AddMajor = ({ onMajorAdded }) => {
  const [majorName, setMajorName] = useState('');
  const [description, setDescription] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const departmentId = location.state?.departmentId;

  useEffect(() => {
    console.log("Received departmentId in AddMajor:", departmentId);
  }, [departmentId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!departmentId) {
      alert('Department ID is missing!');
      return;
    }

    const majorData = {
      majorName,
      description,
      departmentId: departmentId,
    };

    fetch('http://localhost:8081/majors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(majorData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((errorMessage) => {
            alert(errorMessage);  // Show validation errors from the backend
            throw new Error(errorMessage);  // Stop further execution
          });
        }
        return response.json();  // If successful, parse the JSON response
      })
      .then((data) => {
        if (!data || !data.majorId) {
          alert("Major was not added. Please try again.");
          return;
        }
        alert('Major added successfully!');
        console.log('Added major:', data); 
        setMajorName(''); 
        setDescription(''); 
        if (onMajorAdded) onMajorAdded(data); // Notify parent of the addition
        navigate('/majors', { state: { departmentId } });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add A Major</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputContainer">
            <input
              className="inputField"
              type="text"
              value={majorName}
              onChange={(e) => setMajorName(e.target.value)}
              placeholder="Major Name"
            />
          </div>
          <div className="inputContainer">
            <textarea
              className="inputField"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>
          <button type="submit" className="formButton">
            Add Major
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMajor;