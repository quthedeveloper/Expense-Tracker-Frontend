import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Vspinner } from './UI extras/verifySpinner';
import TokenContext from './accessContext/tokenContext';
import AuthLayout from './auth/AuthLayout';

function Otp() {
  const { setAccess } = useContext(TokenContext);
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  let [time, setTime] = useState(JSON.parse(sessionStorage.getItem('time')) || 0);
  const [otpNum, setOtp] = useState([]);
  const [localemail, setEmail] = useState('');
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('email');
    setEmail(email);
  }, []);

  const addTime = () => {
    setTime(60);
    axios.get(`https://login-backend-izl3.onrender.com/otp/sendotp?email=${localemail}`).then(res => {
      if (res.status === 200) {
        setShow(false);
      }
    });
  };

  useEffect(() => {
    let interval;
    if (time <= 60 && time >= 1) {
      interval = setInterval(() => {
        setTime(t => {
          if (t >= 0) {
            const newTime = t - 1;
            sessionStorage.setItem('time', JSON.stringify(newTime));
            return newTime;
          }
        });
      }, 1000);
    }

    const num = JSON.parse(sessionStorage.getItem('time'));
    if (num > 0 && num <= 60) {
      setShow(false);
    } else {
      setShow(true);
    }
    return () => {
      clearInterval(interval);
    };
  }, [time]);

  const appendOTP = (event) => {
    const index = Number(event.target.getAttribute("data-index"));
    setOtp(o => {
      const copy = [...o];
      copy[index] = event.target.value;
      return copy;
    });
  };

  const sendOTP = (e) => {
    e.preventDefault();
    if (otpNum.length !== 6) {
      alert("figures in otp must be six");
    } else {
      setSpin(true);
      //axios post for otp for verification
      axios.post('https://login-backend-izl3.onrender.com/key/verify', {
        otp: otpNum.join(''),
        email: localemail
      }, { withCredentials: true }).then(res => {
        if (res.status === 200) {
          setAccess(res.data?.accessToken);
          navigate('/dashboard');
        }
      }).catch(err => {
        setSpin(false);
        if (err.response?.status === 404) {
          alert('Verification gone wrong, check or request for a new one');
        }
        else if (err.response?.status === 500) {
          alert('Server problem, try again later');
        }
      });
    }
  };

  return (
    <AuthLayout
      tab={null}
      heading="Check your inbox"
      subheading={localemail ? `Enter the 6-digit code sent to ${localemail}` : 'Enter the 6-digit code sent to your email'}
    >
      <form className="auth-form" onSubmit={sendOTP}>
        <div className="otp-boxes">
          <input type="text" inputMode="numeric" className="otp-box" maxLength="1" data-index="0" aria-label="Digit 1" onChange={appendOTP} />
          <input type="text" inputMode="numeric" className="otp-box" maxLength="1" data-index="1" aria-label="Digit 2" onChange={appendOTP} />
          <input type="text" inputMode="numeric" className="otp-box" maxLength="1" data-index="2" aria-label="Digit 3" onChange={appendOTP} />
          <input type="text" inputMode="numeric" className="otp-box" maxLength="1" data-index="3" aria-label="Digit 4" onChange={appendOTP} />
          <input type="text" inputMode="numeric" className="otp-box" maxLength="1" data-index="4" aria-label="Digit 5" onChange={appendOTP} />
          <input type="text" inputMode="numeric" className="otp-box" maxLength="1" data-index="5" aria-label="Digit 6" onChange={appendOTP} />
        </div>

        <button type="submit" className="auth-submit">
          {spin === false ? 'Verify Code' : <Vspinner />}
        </button>
      </form>

      <div className="auth-meta-row">
        <span>Didn&apos;t receive the code?</span>
        {show && <button type="button" className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={addTime}>Resend Code</button>}
        {(time === 60 || (time <= 60 && time >= 1)) && (
          <span className="auth-timer">Resend in {time}s</span>
        )}
      </div>

      <Link to="/register" className="auth-link auth-back">← Back to Register</Link>
    </AuthLayout>
  );
}

export default Otp;
