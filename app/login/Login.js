"use client";
import React, { useEffect, useState } from "react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Forgot password states
  const [step, setStep] = useState("login"); // login | email | otp | reset
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://partnerback.krcustomizer.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Token aur user dono save kar lo
        localStorage.setItem("user_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        // localStorage.setItem("data",JSON.stringify(data));

        // redirect
        window.location.href = "/dashboard";
      }
      else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      // Step 1: Send email for OTP
      const res = await fetch("https://partnerback.krcustomizer.com/auth/forgetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep("otp");
        setSuccessMsg("OTP sent to your email.");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      // Step 2: Verify OTP
      const res = await fetch("https://partnerback.krcustomizer.com/auth/validateOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetToken(data.resetToken || "");
        setStep("reset");
        setSuccessMsg("OTP verified. Set your new password.");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      // Step 3: Reset password (send resetToken, not OTP)
      const res = await fetch("https://partnerback.krcustomizer.com/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, resetToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Password reset successful. Please log in.");
        setStep("login");
        setOtp("");
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);


  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">{step === "login" ? "Login" : step === "otp" ? "Enter OTP" : step === "reset" ? "Reset Password" : "Forgot Password"}</h2>
        <p className="login-subtitle">
          {step === "login"
            ? "Please enter your details to login."
            : step === "email"
              ? "Enter your email to receive OTP."
              : step === "otp"
                ? "Enter the OTP sent to your email."
                : "Set your new password."}
        </p>
        {step === "login" && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your Email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>
            <div className="options">
              <a href="#" className="forgot-link" onClick={() => { setStep("email"); setError(""); setSuccessMsg(""); }}>
                Forgot Password
              </a>
            </div>
            {error && (
              <div className="error-message">
                <FiAlertCircle /> {error}
              </div>
            )}
            {successMsg && (
              <div className="success-message">
                <FiCheckCircle /> {successMsg}
              </div>
            )}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}
        {step === "email" && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your Email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {successMsg && <div className="success-message">{successMsg}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label>OTP</label>
              <input
                type="text"
                placeholder="Enter OTP"
                required
                autoComplete="off"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {successMsg && <div className="success-message">{successMsg}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <div className="password-field">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMsg && <div className="success-message">{successMsg}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}