import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Spinner } from './UI extras/Spinner';
import AuthLayout from './auth/AuthLayout';

// work on JWT verify
function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [FormData, setData] = useState(
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  );
  const [load, setload] = useState(false);

  useEffect(() => {
    if (location.state?.regMessage) {
      alert(location.state.regMessage);
    }
  }, [location.state]);

  const handleChange = (event) => {
    setData({
      ...FormData,
      [event.target.name]: event.target.value
    });
  };

  const handleFormData = (event) => {
    event.preventDefault();
    setload(true);
    const cont = Object.values(FormData).some(value => value === "");
    if (cont) {
      alert('Fill all fields');
      setload(false);
    }
    else {
      axios.post('https://login-backend-izl3.onrender.com/reg/register', FormData)
        .then(async (res) => {
          if (res?.status === 201) {
            localStorage.setItem('email', res.data?.email);
            await axios.get(`https://login-backend-izl3.onrender.com/otp/sendotp?email=${FormData.email}`);
            navigate('/otp');
            setload(false);
          }
        })
        .catch(err => {
          if (err.response?.status === 409) {
            alert('User already exists, enter new credentials');
            navigate('/');
          }
          else if (err.response?.status === 400) {
            alert("Passwords don't match");
          }
          setload(false);
        });
    }
  };

  return (
    <AuthLayout
      tab="register"
      heading="Create your account"
      subheading="Start tracking your expenses today"
    >
      <form className="auth-form" onSubmit={handleFormData}>
        <div className="auth-form-row">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            aria-label="First name"
            className="auth-input"
            required
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            aria-label="Last name"
            className="auth-input"
            required
            onChange={handleChange}
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email"
          className="auth-input"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          aria-label="Password"
          className="auth-input"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          aria-label="Confirm password"
          className="auth-input"
          required
          onChange={handleChange}
        />
        <button type="submit" className="auth-submit">
          {load === false ? 'Create Account' : <Spinner />}
        </button>
      </form>
      <p className="auth-alt">
        Already have an account?{' '}
        <NavLink to="/" className="auth-link">Sign in</NavLink>
      </p>
    </AuthLayout>
  );
}

export default Register;
