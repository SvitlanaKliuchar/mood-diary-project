import React, { useState } from "react";
import styles from "./Landing.module.css";
import logo from "../../assets/images/logo.png";
import navLinks from "../../data/navLinks.js";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //toggle the mobile menu
  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header>
      <nav className={`${styles.navbar} shadow`}>
        <div className={styles.logo}>
          <img src={logo} alt="Harmonia logo, links to homepage" />
        </div>

        <ul className={styles["navbar-links-desktop"]}>
          {navLinks.map((link) => (
            <li key={link.to}>
              <a href={link.to}>{link.label}</a>
            </li>
          ))}
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
          <div className={styles["logo-mobile-menu"]}>
            <img src={logo} alt="Harmonia logo, links to homepage" />
          </div>
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
