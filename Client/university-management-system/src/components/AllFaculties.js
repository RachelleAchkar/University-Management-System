import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllFaculties.css';

const AllFaculties = () => {
  const [faculties, setFaculties] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const adminId = localStorage.getItem('adminId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(`http://localhost:8081/faculties/${adminId}`);
        const data = await response.json();

        console.log("Fetched faculties:", data); // Log the response for debugging

        // Check if the response contains the faculties property and set it
        if (data && Array.isArray(data.faculties)) {
          setFaculties(data.faculties);
        } else {
          console.error("Unexpected API response format:", data);
          setFaculties([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
        setFaculties([]); // Fallback to an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, [adminId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleFacultyClick = (facultyId) => {
    navigate('/departments', { state: { facultyId } });
  };

  const handleAddFacultyClick = () => {
    navigate('/addfaculty');
  };

  return (
    <div className="faculties-container">
      <h1>All Faculties</h1>
      {faculties.length === 0 ? (
        <p>No faculties found.</p>
      ) : (
        <div className="faculties-list">
          {faculties.map((faculty) => (
            <div
              key={faculty._id}
              className="faculty-box"
              onClick={() => handleFacultyClick(faculty._id)}
            >
              {faculty.facultyname}
            </div>
          ))}
        </div>
      )}
      <button onClick={handleAddFacultyClick} className="add-faculty-button">
        Add Faculty
      </button>
    </div>
  );
};

export default AllFaculties;