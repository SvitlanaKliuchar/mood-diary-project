import { useContext, useState } from 'react';
import styles from '../SettingsList.module.css';
import axiosInstance from '../../../utils/axiosInstance.js'
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Gallery = ({ onClose }) => {
 
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  //fetch art pieces based on user id from db! then do artPieces.map((art,index) => {img key src alt})

  return (
    <div className={styles['settings-list']}>
      <button onClick={onClose} className={styles['back-btn']} aria-label="Back">
        ←
      </button>
      <div className={styles['gallery-container']}>
        <p id="delete-account-title" className={styles['main-text']}>
          Explore your gallery!
        </p>
        <ul>
            
        </ul>
    
      </div>
    </div>
  );
};

export default Gallery;
