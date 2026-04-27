import { Link } from "react-router-dom";
import React from "react";

interface AuthLayoutProps { //defines what info the component needs to receive from the pages that use it
  title: string;
  subtitle: string;
  bottomText: string;
  bottomLinkText?: string;
  bottomLinkTo?: string;
  formTitle: string;
  children: React.ReactNode;
}

const AuthLayout = ({ //lays out the whole page 
  title,
  subtitle,
  bottomText,
  bottomLinkText,
  bottomLinkTo,
  formTitle,
  children, //Children lets me manipulate and transform the JSX i received as the children prop.


}: AuthLayoutProps) => { //how components are positioned 
  return (
    <div className="signup-page">

      {/* LOGO */}
      <div className="logo-wrapper">
        <img src="/traveler-logo.svg" alt="Traveler icon" className="logo-icon" />
        <div className="logo-text">
          <span className="logo-title">Traveler</span>
          <span className="logo-subtitle">Traveling made easy</span>
        </div>
      </div>

      {/* LEFT + RIGHT */}
      <div className="signup-content">
        <div className="signup-left">

          {/* LEFT - top */}
          <div className="signup-top-header">
            <h1 className="signup-title">{title}</h1>
            <h2 className="signup-subtitle">{subtitle}</h2>
          </div>

          {/* LEFT - bottom */}
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

        </div>

        {/* RIGHT - form inputs passed in via children */}
        <div className="signup-right">
          <div className="signup-form-title">
            <h2 className="form-title">{formTitle}</h2>
          </div>
          {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;