import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css';

const AllDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
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

      try {
        const response = await fetch(`http://localhost:8081/departments/faculty/${facultyId}`);
        const data = await response.json();

        console.log('Fetched departments:', data); // Log for debugging
        if (response.ok) {
          setDepartments(data);
        } else {
          console.error('Error fetching departments:', data);
          setDepartments([]);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [facultyId]);

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
    navigate('/addDepartment', { state: { facultyId } });
  };

  return (
    <div className="faculties-container">
      <h1>Departments in Faculty</h1>
      {departments.length === 0 ? (
        <p>No departments found.</p>
      ) : (
        <div className="faculties-list">
          {departments.map((department) => (
            <div
              key={department._id}
              className="faculty-box"
              onClick={() => handleDepartmentClick(department._id)}
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