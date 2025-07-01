import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import axios from 'axios';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const SignupPage = () => {
    const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
                email: form.email,
                username: form.username,
                password: form.password,
            });
            console.log('Signup success, navigating to login');
            navigate('/login');
        } catch (err) {
            // If error response is an array of validation errors, show the first message
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail) && detail.length > 0) {
                setError(detail[0].msg);
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError('Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
                <div className="text-center text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                </div>
            </form>
        </div>
    );
};

export default SignupPage;
