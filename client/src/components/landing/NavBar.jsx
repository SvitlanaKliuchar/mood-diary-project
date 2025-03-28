import React, { useContext, useState } from "react";
import styles from "./Landing.module.css";
import logo from "../../assets/images/logo.png";
import navLinks from "../../data/navLinks.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import logoutIcon from "../../assets/icons/menu/logout.svg";
import loginIcon from "../../assets/icons/menu/log-in.svg";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { logout, user } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        console.log("Logout successful.");
      } else {
        console.error("Logout failed. Check for network issues.");
      }
    } catch (err) {
      console.error("Error during logout process: ", err);
    }
  };

  //toggle the mobile menu
  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header>
      <nav className={`${styles.navbar} shadow`}>
        <a href="/home" className={styles.logo}>
          <img src={logo} alt="Harmonia logo, links to homepage" />
        </a>

        <ul className={styles["navbar-links-desktop"]}>
          {navLinks.map((link) => (
            <li key={link.to}>
              <a href={link.to}>{link.label}</a>
            </li>
          ))}
          {user ? (
            <li key={"/"}>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Log out
              </a>
            </li>
          ) : (
            <li key={"/login"}>
              <a href="/login">Log in</a>
            </li>
          )}
        </ul>

        <button
          className={styles["navbar-hamburger"]}
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          ☰
        </button>

        <div
          className={`${styles["mobile-menu-container"]} ${isMobileMenuOpen ? styles["mobile-menu-container--open"] : ""}`}
        >
          <a href="/home" className={styles["logo-mobile-menu"]}>
            <img src={logo} alt="Harmonia logo, links to homepage" />
          </a>
          <ul className={styles["navbar-links-mobile"]}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <img
                  src={link.iconUrl}
                  alt=""
                  className={styles["link-icon"]}
                  aria-hidden="true"
                />
                <a href={link.to} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            {user ? (
              <li
                key={"/"}
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <img
                  src={logoutIcon}
                  alt=""
                  className={styles["link-icon"]}
                  aria-hidden="true"
                />
                <a href="/">Log out</a>
              </li>
            ) : (
              <li>
                <img
                  src={loginIcon}
                  alt=""
                  className={styles["link-icon"]}
                  aria-hidden="true"
                />
                <a href="/login">Log in</a>
              </li>
            )}
          </ul>
          <button
            className={styles["close-menu-btn"]}
            onClick={handleMenuToggle}
          >
            &#x2715;
          </button>
        </div>
        <div
          className={`${styles.overlay} ${isMobileMenuOpen ? styles["overlay--active"] : ""}`}
          onClick={handleMenuToggle}
        ></div>
      </nav>
    </header>
  );
};

export default NavBar;
