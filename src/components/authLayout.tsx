import { Link } from "react-router-dom";
import React from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  bottomText: string;
  bottomLinkText?: string;
  bottomLinkTo?: string;

  formTitle: string;
  children: React.ReactNode;
}

const AuthLayout = ({
  title,
  subtitle,
  bottomText,
  bottomLinkText,
  bottomLinkTo,

  formTitle,
  children,
}: AuthLayoutProps) => {
  return (
    <div className="signup-page">
      {/* LOGO */}
      <div className="logo-wrapper">
        <img
          src="/traveler-logo.svg"
          alt="Traveler icon"
          className="logo-icon"
        />
        <div className="logo-text">
          <span className="logo-title">Traveler</span>
          <span className="logo-subtitle">Traveling made easy</span>
        </div>
      </div>
      {/* LEFT + RIGHT */}
      <div className="signup-content">
        {/* LEFT */}
        <div className="signup-left">
          <div className="signup-top-header">
            <h1 className="signup-title">{title}</h1>
            <h2 className="signup-subtitle">{subtitle}</h2>
          </div>

          <div className="signup-bottom-header">
            <p>
              {bottomText}{" "}
              {bottomLinkText && bottomLinkTo && (
                <Link to={bottomLinkTo} className="Login-link">
                  {bottomLinkText}
                </Link>
              )}
            </p>

         
          </div>
        </div>{" "}
        {/* ← closes signup-left */}
        {/* RIGHT */}
        <div className="signup-right">
          <div className="signup-form-title">
            <h2 className="form-title">{formTitle}</h2>
          </div>
          {children}
        </div>{" "}
        {/* ← closes signup-right */}
      </div>{" "}
      {/* ← closes signup-content */}
    </div> // ← closes signup-page
  );
};

export default AuthLayout;
