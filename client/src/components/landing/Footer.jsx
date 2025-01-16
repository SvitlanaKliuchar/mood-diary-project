import React from 'react';
import styles from './Landing.module.css'

const Footer = () => {
  return (
    <footer>
      <div className={styles['footer-content']}>
        <div className={styles['footer-links']}>
          <div>
            <h3>Support</h3>
            <a href="#">Contact us</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <h3>About us</h3>
            <a href="#">About</a>
            <a href="#">Guide</a>
          </div>
          <div>
            <h3>Legal</h3>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </div>
        <p>&copy; 2025 Harmonia. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;