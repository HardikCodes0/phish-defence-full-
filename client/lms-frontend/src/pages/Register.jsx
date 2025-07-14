import React, { useState, useContext, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { registerUser } from '../api/user';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';

const API_URL = import.meta.env.VITE_API_URL || 'https://phish-defence-full.onrender.com';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Show loading if checking authentication status
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'At least 3 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'At least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const res = await registerUser({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        alert('✅ Registration successful. Please login.');
        console.log(res.data);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        navigate('/login');
      } catch (err) {
        console.error(err);
        alert(
          '❌ Registration failed: ' + (err.response?.data?.message || err.message)
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-teal-500 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join thousands protecting their organizations
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              Icon={User}
              placeholder="Enter your username"
            />

            <InputField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              Icon={Mail}
              placeholder="Enter your email"
            />

            <InputField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              Icon={Lock}
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              toggleType={() => setShowPassword(!showPassword)}
              showToggle={showPassword}
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              Icon={Lock}
              placeholder="Confirm your password"
              type={showConfirmPassword ? 'text' : 'password'}
              toggleType={() => setShowConfirmPassword(!showConfirmPassword)}
              showToggle={showConfirmPassword}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Google Sign Up Button */}
          <div className="mt-6 text-center">
            <a href={`${API_URL}/api/auth/google`}>
              <button className="w-full bg-white border border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-gray-700 dark:text-white py-3 rounded-lg flex justify-center items-center space-x-2 shadow-sm hover:shadow-md transition mb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="h-5 w-5 mr-2" />
                <span>Sign up with Google</span>
              </button>
            </a>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-500 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  Icon,
  placeholder,
  type = 'text',
  toggleType,
  showToggle
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
        }`}
        placeholder={placeholder}
      />
      {toggleType && (
        <button
          type="button"
          onClick={toggleType}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showToggle ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      )}
    </div>
    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
  </div>
);

export default Register;
