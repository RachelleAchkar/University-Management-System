import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import './SignIn.css';
import 'font-awesome/css/font-awesome.min.css';

const SignIn = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || ''); 
    const [password, setPassword] = useState(location.state?.password || ''); 
    const [passwordVisible, setPasswordVisible] = useState(false);

    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:8080/admin/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('adminId', data.adminId);
                alert('Sign-In Successful!');
                navigate('/faculties');
            } else {
                const errorMessage = await response.json();
                alert(`Sign-In Failed: ${errorMessage.message}`);
            }
        } catch (error) {
            console.error('Error during sign-in:', error);
        }
    };
    

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="containerOfSignIn">
            <div className="form">
                <h2 className="signInTitle">Sign In</h2>
                <form onSubmit={handleSignIn}>
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
                        Sign In
                    </button>
                    <div className="createaccount">
                        Don't have an account? <Link to="/signup">Create One</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
