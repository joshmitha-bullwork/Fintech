'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import PropTypes from 'prop-types'; // 🟢 FIX: Import PropTypes
import styles from './login.module.css';

// Get the API URL from the environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 🟢 FIX 1: Extracted the Message component (done in previous step)
// and now adding prop validation to it.
const Message = ({ msg }) => msg ? (
    <div className={`${styles.message} ${msg.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
      {msg.text}
    </div>
) : null;

// 🟢 FIX 2: Add PropTypes validation for 'msg', 'msg.type', and 'msg.text' (S6774)
Message.propTypes = {
    msg: PropTypes.shape({
        text: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['success', 'error']).isRequired,
    }),
};

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: ''});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/register`;
      const payload = isLogin
        ? { email: formData.email }
        : formData;

      const response = await axios.post(endpoint, payload, {
        withCredentials: true
      });

      const data = response.data;
      setLoading(false);

      if (isLogin) {
        showMessage(data.message || 'OTP sent successfully.', 'success');
        router.push(`/Otp?email=${formData.email}`);
      } else {
        showMessage('Registration successful. Please log in to continue.', 'success');
        setIsLogin(true);
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      showMessage(errorMessage, 'error');
    }
  };
  
  const handleToggle = () => {
      setIsLogin(!isLogin);
      setMessage(null);
  };
  
  // NOTE: The previously existing commented-out code (S125) is now removed from the file.

  return (
    <div className={styles.mainContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            Fintech
          </Link>
        </div>
        <Message msg={message} />
        <h2 className={styles.title}>
          {isLogin ? 'Login to your account' : 'Create a new account'}
        </h2>
        <div className={styles.toggleButtons}>
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage(null);
            }}
            className={`${styles.toggleButton} ${isLogin ? styles.active : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setMessage(null);
            }}
            className={`${styles.toggleButton} ${!isLogin ? styles.active : ''}`}
          >
            Signup
          </button>
        </div>
        <form onSubmit={handleAuthSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className={styles.inputField} required />
              <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} className={styles.inputField} pattern="[0-9]{10,15}" title="Phone number must be 10-15 digits" required />
            </>
          )}
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={styles.inputField} required />
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? <Loader2 className={styles.loaderIcon} size={20} /> : null}
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        <p className={styles.toggleText}>
          {isLogin ? "Not a member?" : "Already a member?"}{' '}
          <button type="button" onClick={handleToggle} className={styles.toggleLink}>
            {isLogin ? "Signup now" : "Login now"}
          </button>
        </p>
      </div>
    </div>
  );
}