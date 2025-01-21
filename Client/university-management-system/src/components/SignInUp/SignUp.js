import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.css';
import 'font-awesome/css/font-awesome.min.css';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const admin = { firstName, lastName, email, password };

    try {
        const response = await fetch('http://localhost:8080/admin/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(admin),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Sign-Up Successful:', data);
            if (data.adminId) {
                localStorage.setItem('adminId', data.adminId); // Save adminId to localStorage
                alert('Sign-Up Successful!');
                navigate('/', { state: { email, password } });
            } else {
                console.error('adminId is missing in the response');
                alert('Sign-Up Failed! adminId not received.');
            }
        } else {
            const errorMessage = await response.json();  // Get the error message from response
            alert(`Sign-Up Failed: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error('Error during sign-up:', error);
        alert('An error occurred. Please try again.');
    }
};


  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="containerOfSignIn">
      <div className="form">
        <h2 className="signInTitle">Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <div className="inputContainer">
            <input
              className="input1"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="First Name"
            />
          </div>
          <div className="inputContainer">
            <input
              className="input1"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Last Name"
            />
          </div>
          <div className="inputContainer">
            <input
              className="input1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
            />
          </div>
          <div className="inputContainer passwordContainer">
            <input
              className="input1"
              type={passwordVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
            <button
              type="button"
              className="eyeButton"
              onClick={togglePasswordVisibility}
            >
              <i className={`fa ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
          </div>
          <button type="submit" className="signinbutton">
            Sign Up
          </button>
          <div className="createaccount">
            Already have an account? <Link to="/">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;