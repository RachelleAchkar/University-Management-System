import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css';

const AllDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z'); // Default sort order
  const location = useLocation();
  const navigate = useNavigate();
  const facultyId = location.state?.facultyId;

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!facultyId) {
        console.error('Faculty ID is missing!');
        setLoading(false);
        return;
      }

      const orderByColumn = 'departmentName';
      const orderByDirection = sortOrder === "A-Z" ? "ASC" : "DESC"; 

      const apiUrl = `http://localhost:8080/departments/faculty/${facultyId}?search=${searchQuery}&orderByDirection=${orderByDirection}&orderByColumn=${orderByColumn}`;
      
      console.log("Fetching from API:", apiUrl);

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log("API Response:", data); 
        if (response.ok) {
          setDepartments(data);
        } else {
          setDepartments([]); // Handle empty or error response
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      } finally {
        setLoading(false); // Remove loading state after the API call
      }
    };

    fetchDepartments();
  }, [facultyId, searchQuery, sortOrder]); // Trigger fetch when facultyId, searchQuery, or sortOrder changes

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!facultyId) {
    return <p>Faculty not found. Please go back and select a faculty.</p>;
  }

  const handleDepartmentClick = (departmentId) => {
    navigate('/majors', { state: { departmentId } });
  };

  const handleAddDepartment = () => {
    navigate(`/addDepartment`, { state: { facultyId } });
  };

  return (
    <div className="faculties-container">
      <h1>Departments in Faculty</h1>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} className="search-bar"
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
      {departments.length === 0 ? (
        <p>No departments found.</p>
      ) : (
        <div className="faculties-list">
          {departments.map((department) => (
            <div
              key={department.departmentID}
              className="faculty-box"
              onClick={() => handleDepartmentClick(department.departmentID)}
            >
              {department.departmentName}
            </div>
          ))}
        </div>
      )}
      <button className="add-faculty-button" onClick={handleAddDepartment}>
        Add Department
      </button>
    </div>
  );
};

export default AllDepartments;