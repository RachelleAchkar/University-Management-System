import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css'; 

const AllInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const majorId = location.state?.majorId;
  const [searchQuery, setSearchQuery] = useState('');  
  const [searchTerm, setSearchTerm] = useState("");  

 
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const url = new URL(`http://localhost:8080/instructors/${majorId}`);
        if (searchTerm && searchTerm.trim() !== "") {
          url.searchParams.append("search", searchTerm);  // Append search term to the URL
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setInstructors(data);
        } else {
          setInstructors([]); // No content or error
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, [majorId, searchTerm]); 

  // Handle search query change
  const handleSearchChange = () => {
    setSearchTerm(searchQuery);  
  };

  // Handle clearing the search input
  const handleClearSearch = () => {
    setSearchQuery(""); 
    setSearchTerm("");   
  };

 if (loading) {
    return <p>Loading...</p>;
  }

  const handleAddInstructorClick = () => {
    navigate('/addInstructor', { state: { majorId } });
  };

  const handleBackToMajorDetails = () => {
    navigate('/majordetails', { state: { majorId } });
  };

  

  if (!majorId) {
    return <p>Major not found. Please go back and select a major.</p>;
  }

  if (loading) {
    return <p>Loading instructors...</p>;
  }

  return (
    <div className="faculties-container">
      {/* Back Button */}
      <button
        className="back-button"
        onClick={handleBackToMajorDetails}
        title="Back to Major Details"
      >
        🢀
      </button>

      <h1>Instructors</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="search-button" onClick={handleSearchChange}>🔍 Search</button>
        <button className="clear-button" onClick={handleClearSearch}>❌ Clear</button>
      </div>
      {instructors.length === 0 ? (
        <p>No instructors found for this major.</p>
      ) : (
        <div className="faculties-list">
          {instructors.map((instructor) => (
            <div
              key={instructor.instructorId} 
              className="faculty-box"
            >
              <h3>{instructor.firstName} {instructor.lastName}</h3>
              <div className="course-details">
      <div className="course-detail">
        <span className="label">Date of Birth:</span> <span>{instructor.dob}</span>
      </div>
      <div className="course-detail">
        <span className="label">Email:</span> <span>{instructor.email}</span>
      </div>
      <div className="course-detail">
        <span className="label">Phone Number:</span> <span>{instructor.phoneNumber}</span>
      </div>
      <div className="course-detail">
        <span className="label">Address:</span> <span>{instructor.address}</span>
      </div>
      <div className="course-detail">
        <span className="label">Hire Date:</span> <span>{instructor.hireDate}</span>
      </div>
      <div className="course-detail">
        <span className="label">Salary:</span><span>{instructor.salary} $</span>
      </div>
    </div>
            </div>
          ))}
        </div>
      )}
      {/* Add Instructor Button */}
      <button className="add-faculty-button" onClick={handleAddInstructorClick}>
        Add Instructor
      </button>
    </div>
  );
};

export default AllInstructors;