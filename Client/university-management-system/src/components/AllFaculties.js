import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllFaculties.css';

const AllFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z'); // Default sort order
  const adminId = localStorage.getItem('adminId');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchFaculties = async () => {
      const orderByColumn = "facultyName"; 
      const orderByDirection = sortOrder === "A-Z" ? "ASC" : "DESC"; 
  
      const apiUrl = `http://localhost:8080/faculties/admin/${adminId}?orderByColumn=${orderByColumn}&orderByDirection=${orderByDirection}&search=${searchQuery}`;
      
      console.log("Fetching from API:", apiUrl);
  
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
  
        console.log("API Response:", data);
  
        if (response.ok) {
          setFaculties(data); // Store fetched faculties in state
        } else {
          setFaculties([]); // Clear faculty list on error
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFaculties();
  }, [adminId, sortOrder, searchQuery]);
  


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
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-dropdown"
        >
          <option value="A-Z">Sort by Name (A-Z)</option>
          <option value="Z-A">Sort by Name (Z-A)</option>
        </select>
      </div>
      {faculties.length === 0 ? (
        <p>No faculties found.</p>
      ) : (
        <div className="faculties-list">
          {faculties.map((faculty) => (
            <div
              key={faculty.facultyId}
              className="faculty-box"
              onClick={() => handleFacultyClick(faculty.facultyId)}
            >
              {faculty.facultyName}
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
