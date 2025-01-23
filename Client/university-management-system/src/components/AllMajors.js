import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css';

const AllMajors = () => {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const departmentId = location.state?.departmentId;

  const fetchMajors = async () => {
    if (!departmentId) {
      console.error('Department ID is missing!');
      setLoading(false);
      return;
    }
  
    
  
    try {
      const response = await fetch(
        `http://localhost:8081/majors/${departmentId}`
      );
      if (!response.ok) {
        console.error('Failed to fetch majors:', response.status);
        setMajors([]); // Set an empty array if the response is not OK
      } else {
        const data = await response.json();
        setMajors(data);
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
      setMajors([]); // Ensure majors is never undefined
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchMajors();
  }, [departmentId]); // Only fetch majors when departmentId changes


  if (loading) {
    return <p>Loading...</p>;
  }

  const handleMajorClick = (majorId) => {
    navigate(`/majorDetails/${majorId}`, { state: { majorId } });
  };

  const handleAddMajorClick = () => {
    navigate('/addmajor', { state: { departmentId } });
  };

  return (
    <div className="faculties-container">
      <h1>Majors in Department</h1>
      {majors.length === 0 ? (
        <p>No majors found for this department.</p>
      ) : (
        <div className="faculties-list">
          {majors.map((majors) => (
            <div
              key={majors._id}
              className="faculty-box"
              onClick={() => handleMajorClick(majors._id)}
            >
              {majors.majorName}
            </div>
          ))}
        </div>
      )}
      <button onClick={handleAddMajorClick} className="add-faculty-button">
        Add Major
      </button>
    </div>
  );
};

export default AllMajors;