import React, { useState } from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import styles from './Home.module.css'

const Header = () => {
    const [displayedDate, setDisplayedDate] = useState(new Date())

    const handlePrevMonth = () => {
        setDisplayedDate((prevDate) => subMonths(prevDate, 1))
    }
    const handleNextMonth = () => {
        setDisplayedDate((prevDate) => addMonths(prevDate, 1))
    }
    const formattedDate = format(displayedDate, "MMMM yyyy")

  return (
    <header className={styles['home-header']}>
        <nav className={styles['date-nav']}>
            <button 
                className={styles['date-nav-btn']}
                onClick={handlePrevMonth}
                aria-label='Previous Month' 
            >
                &lt;
            </button>
            <span className={styles['displayed-date']}>{formattedDate}</span>
            <button 
                className={styles['date-nav-btn']}
                onClick={handleNextMonth}
                aria-label='Next Month' 
            >
                &gt;
            </button>
        </nav>
        <div className={styles['header-content']}>
            <h2 className={styles['header-text']}>Share how you've been feeling today, username</h2>
        </div>  
        <button
                className={styles['add-entry-btn']}
                aria-label='Add entry' 
            >
            </button>    
    </header>
  );
};

export default Header;