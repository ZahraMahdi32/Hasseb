import React, { useState } from "react";
import { Mail, User, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import "./Haseebauth.css"; // reuse your existing styling
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [verifyData, setVerifyData] = useState({
    email: "",
    username: ""
  });

  const [resetData, setResetData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [userId, setUserId] = useState(null);

  const handleVerifyChange = (e) => {
    setVerifyData({ ...verifyData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const verifyUser = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5001/api/users/forgot-password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyData)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg);
      return;
    }

    setUserId(data.userId);
    setStep(2);
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (resetData.newPassword !== resetData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch("http://localhost:5001/api/users/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        newPassword: resetData.newPassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg);
      return;
    }

    alert("Password updated! Check your email.");
    navigate("/auth");
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            
            <button className="back-to-home-btn" onClick={() => navigate("/auth")}>
              <ArrowLeft className="back-icon" />
              Back to Login
            </button>

            {step === 1 && (
              <>
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-subtitle">Verify your account</p>

                <form onSubmit={verifyUser} className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={verifyData.email}
                        onChange={handleVerifyChange}
                        placeholder="Enter your email"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrapper">
                      <User className="input-icon" />
                      <input
                        type="text"
                        name="username"
                        value={verifyData.username}
                        onChange={handleVerifyChange}
                        placeholder="Enter your username"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-submit" type="submit">
                    Verify Identity
                    <CheckCircle className="btn-icon" />
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="auth-title">Create New Password</h2>
                <p className="auth-subtitle">Make sure it's a strong one!</p>

                <form onSubmit={resetPassword} className="auth-form">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        name="newPassword"
                        value={resetData.newPassword}
                        onChange={handleResetChange}
                        placeholder="Enter new password"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={resetData.confirmPassword}
                        onChange={handleResetChange}
                        placeholder="Confirm new password"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-submit" type="submit">
                    Reset Password
                    <CheckCircle className="btn-icon" />
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}