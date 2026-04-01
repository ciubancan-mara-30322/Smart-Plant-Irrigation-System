import React, { useState } from 'react';
import axios from 'axios';
import '../pages_design/Register.css'; 

const Register = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const { username, email, password } = formData;

  const onChange = (e) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await axios.post("http://172.20.10.4:5000/api/auth/register", {
        username,
        email,
        password
      });

      setMessage({ type: 'success', text: "Account created successfully! You can login now." });
      
      setTimeout(() => {
        switchToLogin(); 
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Register error.";
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
      <div className="auth-card">
        <div className="auth-banner">
          <h3>Already have an account?</h3>
          <p>Go back to Dashboard to monitor your plants in real time.</p>
          <button className="btn-switch" onClick={switchToLogin}>
            Login here
          </button>
          
          <div className="plant-decoration" style={{ fontSize: '3rem', marginTop: '20px' }}>🌸</div>
        </div>
        <div className="auth-form-section">
          <h2>Create an account</h2>
          <p>Join the SproutJoy community and take care of your plants.</p>
          
          {message.text && (
            <div className={message.type === 'error' ? 'error-msg' : 'success-msg'} 
                 style={{ 
                    marginBottom: '20px', 
                    padding: '10px', 
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                    color: message.type === 'error' ? '#ef4444' : '#10b981',
                    border: `1px solid ${message.type === 'error' ? '#fecaca' : '#a7f3d0'}`
                 }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                name="username" 
                value={username} 
                onChange={onChange} 
                required 
                placeholder="Ex: AndreiPopescu"
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange} 
                required 
                placeholder="example@email.com"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={onChange} 
                required 
                placeholder="At least 6 characters "
              />
            </div>

            <button type="submit" className="submit-btn">
              Register and grow 🌱
            </button>
          </form>
        </div>

      </div>
  );
};

export default Register;