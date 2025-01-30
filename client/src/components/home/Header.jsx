import React, { useContext, useState } from "react";
import { format, subMonths, addMonths } from "date-fns";
import styles from "./Home.module.css";
import { AuthContext } from "../../contexts/AuthContext";
import { EntriesContext } from "../../contexts/EntriesContext";

const Header = () => {
  const { displayedDate, setDisplayedDate, refreshEntries } = useContext(EntriesContext)
  const { user } = useContext(AuthContext);

  const handlePrevMonth = () => {
    setDisplayedDate((prevDate) => {
      const newDate = subMonths(prevDate, 1)
      refreshEntries()
      return newDate
    });
  };
  const handleNextMonth = () => {
    setDisplayedDate((prevDate) => {
      const newDate = addMonths(prevDate, 1)
      refreshEntries()
      return newDate
    });
  };
  const formattedDate = format(displayedDate, "MMMM yyyy");

  return (
    <header className={styles["home-header"]}>
      <nav className={styles["date-nav"]}>
        <button
          className={styles["date-nav-btn"]}
          onClick={handlePrevMonth}
          aria-label="Previous Month"
        >
          &lt;
        </button>
        <span className={styles["displayed-date"]}>{formattedDate}</span>
        <button
          className={styles["date-nav-btn"]}
          onClick={handleNextMonth}
          aria-label="Next Month"
        >
          &gt;
        </button>
      </nav>
      <div className={styles["header-content"]}>
        <h2 className={styles["header-text"]}>
          Share how you've been feeling today, {user ? user.username : "user"}
        </h2>
      </div>
      <a
        className={styles["add-entry-btn"]}
        aria-label="Add entry"
        href="/entry"
      ></a>
    </header>
  );
};

export default Header;
