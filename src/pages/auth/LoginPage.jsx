import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validationUtils } from '../../utils/validation';
import { MESSAGES } from '../../constants/messages';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Clear any existing toasts on mount
    toast.dismiss();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validationUtils.required(formData.email)) {
      newErrors.email = MESSAGES.REQUIRED_FIELD;
    } else if (!validationUtils.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validationUtils.required(formData.password)) {
      newErrors.password = MESSAGES.REQUIRED_FIELD;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(formData);
      if (result.success) {
        toast.success(MESSAGES.LOGIN_SUCCESS);
      } else {
        toast.error(result.error || MESSAGES.LOGIN_FAILED);
      }
    } catch (error) {
      toast.error(MESSAGES.LOGIN_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <MessageSquare className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to Linguabot
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your AI-powered conversational partner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              Sign in
            </Button>
          </form>
          <div className="text-center text-sm mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;