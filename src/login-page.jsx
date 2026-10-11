import { NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import axios from 'axios';
import TokenContext from './accessContext/tokenContext';
import { Spinner } from './UI extras/Spinner';
import AuthLayout from './auth/AuthLayout';

function Login({ settertoken }) {
  const { setAccess } = useContext(TokenContext);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [load, setLoad] = useState(false);

  const handleChange = (event) => {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoad(true);
    axios.post('https://login-backend-izl3.onrender.com/login/log', loginData, {
      withCredentials: true
    })
    .then(res => {
      if (res.status === 200) {
        localStorage.setItem('email', res.data.email);
        const key = res.data.accessToken;
        setAccess(key);
        settertoken(key);
        navigate('/dashboard');
      }
    }).catch(err => {
      setLoad(false);
      if (err.response?.status === 401) {
        alert('User does not exist, click Register to create an account');
      } else if (err.response?.status === 404) {
        alert('Wrong password, please try again');
      } else {
        alert('Could not sign in, check your connection and try again');
      }
    });
  };

  return (
    <AuthLayout
      tab="login"
      heading="Hi, welcome back"
      subheading="Sign in to your ExpenseTracker account"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
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
        <div className="auth-row">
          <a href="#" className="auth-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
        </div>
        <button type="submit" className="auth-submit">
          {load ? <Spinner /> : 'Sign In'}
        </button>
      </form>
      <p className="auth-alt">
        Don&apos;t have an account?{' '}
        <NavLink className="auth-link" to="/register">Register</NavLink>
      </p>
    </AuthLayout>
  );
}

export default Login;
