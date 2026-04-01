import React, { useState } from 'react';
import axios from 'axios';
import '../pages_design/Login.css';

const Login = ({ setToken, switchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 1. Send request to server
            const res = await axios.post("http://172.20.10.4:5000/api/auth/login", {
                email,
                password
            });

            // 2. Save the data in Browser
            localStorage.setItem("token", res.data.token);
            
            //Avoid the "Guest" error in Dashboard
            localStorage.setItem("user", JSON.stringify({
                id: res.data.user.id,
                username: res.data.user.username
            }));

            // 3. Update application status
            setToken(res.data.token);
            
            alert(`Login successful! Welcome, ${res.data.user.username}!`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Email or password are wrong!");
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-banner">
                <h3>New here?</h3>
                <p>Start monitoring your plant smarter.</p>
                <button onClick={switchToRegister} className="btn-switch">
                    Create an account
                </button>
                <div className="plant-decoration" style={{ fontSize: '3rem', marginTop: '20px' }}>🌱</div>
            </div>

            <div className="auth-form-section">
                <h2>Login</h2>
                <p>Welcome back! Insert your credentials to see your garden.</p>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email address</label>
                        <input 
                            type="email" 
                            placeholder="example@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-btn">Login to Dashboard</button>
                </form>
            </div>
        </div>
    );
};

export default Login;