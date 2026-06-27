import React, { useState } from 'react';
import { register, login } from '../api';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
        if (isLogin) {
            const res = await login({ username: formData.username, password: formData.password });
            // If login is successful, res.data will exist
            localStorage.setItem('user_id', res.data.user_id);
            setUser(res.data.user_id);
            navigate('/search');
        } else {
            await register(formData);
            alert("Account created! Now please Login.");
            setIsLogin(true);
        }
    } catch (err) {
        // Safe error checking
        const errorMsg = err.response?.data?.error || "An error occurred. Please try again.";
        setError(errorMsg);
        console.error("Full error:", err);
    }
};

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <div className="card shadow p-4">
                <h2 className="text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Username</label>
                        <input type="text" className="form-control" onChange={e => setFormData({...formData, username: e.target.value})} required />
                    </div>
                    {!isLogin && (
                        <div className="mb-3">
                            <label>Email</label>
                            <input type="email" className="form-control" onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    )}
                    <div className="mb-3">
                        <label>Password</label>
                        <input type="password" className="form-control" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    </div>
                    <button className="btn btn-primary w-100">{isLogin ? 'Login' : 'Register'}</button>
                </form>
                <p className="mt-3 text-center" style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </p>
            </div>
        </div>
    );
};

export default Auth;