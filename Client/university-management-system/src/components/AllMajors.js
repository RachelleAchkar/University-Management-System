import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css';

const AllMajors = () => {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z'); // Default sort order
  const location = useLocation();
  const navigate = useNavigate();
  const departmentId = location.state?.departmentId;

  const fetchMajors = async () => {
    if (!departmentId) {
      console.error('Department ID is missing!');
      setLoading(false);
      return;
    }
  
    const orderByColumn = 'majorName';
    const orderByDirection = sortOrder === 'A-Z' ? 'ASC' : 'DESC';
    const search = searchQuery || '';
  
    try {
      const response = await fetch(
        `http://localhost:8080/majors/department/${departmentId}?orderByColumn=${orderByColumn}&orderByDirection=${orderByDirection}&search=${encodeURIComponent(search)}`
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
  }, [searchQuery, sortOrder]);

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
      {majors.length === 0 ? (
        <p>No majors found for this department.</p>
      ) : (
        <div className="faculties-list">
          {majors.map((major) => (
            <div
              key={major.majorId}
              className="faculty-box"
              onClick={() => handleMajorClick(major.majorId)}
            >
              {major.majorName}
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