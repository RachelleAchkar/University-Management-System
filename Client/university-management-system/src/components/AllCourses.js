import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllFaculties.css';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('instructor'); // Default to instructor filter
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const location = useLocation();
  const navigate = useNavigate();
  const majorId = location.state?.majorId;

  // Fetch courses based on selected filter
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      let url = '';
      let queryParams = '';

      // Determine the filter type and build the API URL
      if (filterType === 'instructor') {
        url = `http://localhost:8081/courses/major/${majorId}`;
      } else if (filterType === 'filtered') {
        queryParams = `majorId=${majorId}`;
        url = `http://localhost:8081/courses/filtered/${majorId}?${queryParams}`;
      } else if (filterType === 'secondYear') {
        queryParams = `majorId=${majorId}`;
        url = `http://localhost:8081/courses/secondYearSemester/${majorId}?${queryParams}`;
      } else if (filterType === 'mandatoryCreditsSemester') {
        url = `http://localhost:8081/courses/mandatoryFiltered/${majorId}`;
      } else if (filterType === 'optionalThirdYear') {
        url = `http://localhost:8081/courses/optionalThirdYear/${majorId}`;
      }

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          setCourses([]); // No content or error
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [majorId, filterType]);

  const handleAddCourseClick = () => {
    navigate('/addCourse', { state: { majorId } });
  };

  const handleBackToMajorDetails = () => {
    navigate('/majordetails', { state: { majorId } });
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm)
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!majorId) {
    return <p>Major not found. Please go back and select a major.</p>;
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

      <h1>Courses</h1>

      {/* Filter Selection */}
      <div className="filter-selection">
        <label>Select Filter:</label>
        <select onChange={handleFilterChange} value={filterType}>
          <option value="instructor">All Courses</option>
          <option value="filtered">Grade Level greater than 1 or Credits 3-6</option>
          <option value="secondYear">Grade Level = Second Year (Semester Number greater than 2)</option>
          <option value="mandatoryCreditsSemester">
            Mandatory Courses: Credits = 3 OR Semester = 4
          </option>
          <option value="optionalThirdYear">
            Optional Courses: Grade Level = Third Year
          </option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search for a course..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <p>No courses found for this major.</p>
      ) : (
        <div className="faculties-list">
          {filteredCourses.map((course) => (
            <div key={course.courseId} className="faculty-box">
              <h3>{course.courseName}</h3>
              <div className="course-details">
                <div className="course-detail">
                  <span className="label">Credits:</span> <span>{course.credits}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Description:</span> <span>{course.description}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Grade Level:</span> <span>{course.gradeLevel}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Semester Number:</span> <span>{course.semesterNumber}</span>
                </div>
                <div className="course-detail">
                  <span className="label">Course Type:</span> <span>{course.courseType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="add-faculty-button" onClick={handleAddCourseClick}>
        Add Course
      </button>
    </div>
  );
};

export default AllCourses;
