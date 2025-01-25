import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AddStudent.css";

const AddInstructor = () => {
  const location = useLocation();
  const majorId = location.state?.majorId;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    dob: "",
    email: "",
    phonenumber: "",
    address: "",
    hiredate: "", // Use hiredate here
    salary: "",
    majorId: majorId || "",
  });
  
  const [image, setImage] = useState(null);
  const [cv, setCv] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "image") {
      setImage(files[0]);
    } else if (name === "cv") {
      setCv(files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
      // Ensure hireDate is a valid date string
  if (!formData.hiredate || isNaN(new Date(formData.hiredate).getTime())) {
    alert("Invalid hire date.");
    return;
  }

  
    // Create FormData object for multipart/form-data
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      // Update formData key names to match server-side expected field names
      const serverKey = key.toLowerCase(); // Convert keys to lowercase for matching
      data.append(serverKey, formData[key]);
    });
    if (image) {
      data.append("image", image);
    }
    if (cv) {
      data.append("cv", cv);
    }
  
    fetch("http://localhost:8081/instructor/add", {
      method: "POST",
      body: data,
    })
      .then(async (response) => {
        if (response.ok) {
          alert("Instructor added successfully!");
          navigate("/allInstructors", { state: { majorId } });
        } else {
          const errorMessage = await response.text();
          alert(`Validation Error:\n${errorMessage}`);
        }
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  };
  
  
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <h2 className="formTitle">Add Instructor</h2>
        <form onSubmit={handleSubmit}>
          {/* Text Inputs */}
          <div className="inputContainer1">
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phonenumber"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="hiredate">Hire Date</label>
            <input
              type="date"
              id="hiredate"
              name="hiredate"
              value={formData.hiredate}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="salary">Salary</label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="inputField"
              required
            />
          </div>

          {/* File Inputs */}
          <div className="inputContainer1">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="inputField"
              required
            />
          </div>
          <div className="inputContainer1">
            <label htmlFor="cv">CV (PDF)</label>
            <input
              type="file"
              id="cv"
              name="cv"
              accept="application/pdf"
              onChange={handleFileChange}
              className="inputField"
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="formButton">
            Add Instructor
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInstructor;
