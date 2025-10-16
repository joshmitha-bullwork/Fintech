'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import PropTypes from 'prop-types'; // 🟢 FIX 1: Import PropTypes
import { Loader2, CheckCircle, XCircle, MoveLeft } from 'lucide-react';
import styles from './otp.module.css';

// Get the API base URL from the environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Refactored OtpInput to be a separate component for reusability
// This component has the two SonarLint warnings.
const OtpInput = ({ onComplete }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef(new Array(6).fill(null));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);

    // Focus next input if current one is filled
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus back on Backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    const fullOtp = otp.join("");
    if (fullOtp.length === 6) {
      onComplete(fullOtp);
    }
  }, [otp, onComplete]);

  return (
    <div className={styles.otpInputContainer}>
      {otp.map((data, index) => (
        <input
          // 🟢 FIX 3: Use a stable key (static prefix + index) instead of just the array index (S6479)
           key={`otp-digit-${index}`} 
          className={styles.otpInputField}
          type="text"
          maxLength="1"
          value={data}
          onChange={e => handleChange(e.target, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onFocus={e => e.target.select()}
          ref={el => inputRefs.current[index] = el}
        />
      ))}
    </div>
  );
};

// 🟢 FIX 2: Add PropTypes validation for 'onComplete' (S6774)
OtpInput.propTypes = {
    onComplete: PropTypes.func.isRequired,
};


export default function OtpComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otpValue, setOtpValue] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/Login');
    }
  }, [email, router]);

  const handleOtpChange = (newOtp) => {
    setOtpValue(newOtp);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp: otpValue
      }, {
        withCredentials: true,
      });
      setMessage({ type: 'success', text: response.data.message || 'Verification successful! Redirecting...' });
      setTimeout(() => router.push('/Dashboard'), 1000); 
    } catch (error) {
      setLoading(false);
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.card}>
        <Link href="/Login" className={styles.backLink}>
          <MoveLeft size={16} /> Back
        </Link>
        <h2 className={styles.title}>Verify OTP</h2>
        <p className={styles.subtitle}>
          An OTP has been sent to **{email}**.
        </p>
        {message && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}
        <div className={styles.formContainer}>
          <OtpInput onComplete={handleOtpChange} />
          <button onClick={handleVerifyOtp} disabled={loading || otpValue.length !== 6} className={styles.verifyButton}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            {loading ? 'Verifying...' : 'Verify & Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}