import React, { useContext, useEffect, useState } from "react";
import styles from "./Home.module.css";
import { AuthContext } from "../../contexts/AuthContext";
import moods from "../../data/moods.js";
import { EntriesContext } from "../../contexts/EntriesContext.jsx";
import { LoadingContext } from "../../contexts/LoadingContext.jsx";
import NotificationModal from "../gen-art/NotificationModal.jsx";
import { useNavigate } from "react-router-dom";

const Entries = () => {
  const { entries, refreshEntries, displayedDate, updateEntry, deleteEntry } =
    useContext(EntriesContext);
  const [error, setError] = useState(null);

  const { user, loading: authLoading } = useContext(AuthContext);
  const { startLoading, finishLoading, loadingCount } =
    useContext(LoadingContext);

  const isLoading = loadingCount > 0;

  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [previousEntryCount, setPreviousEntryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      const fetchEntries = async () => {
        try {
          startLoading();
          await refreshEntries();
          setError(null);
        } catch (err) {
          if (err.response) {
            setError(err.response.data.message || "Failed to fetch entries.");
          } else if (err.request) {
            setError("No response from server. Please try again later.");
          } else {
            setError("An unexpected error occurred.");
            throw err;
          }
        } finally {
          finishLoading();
        }
      };
      fetchEntries();
    }
  }, [authLoading, user, displayedDate]);

  useEffect(() => {
    if (previousEntryCount < 5 && entries.length >= 5) {
      setShowUnlockNotification(true);
      // store in localStorage that notification was shown
      localStorage.setItem("artFeatureUnlockNotificationShown", "true");
    }
    setPreviousEntryCount(entries.length);
  }, [entries.length]);

  const handleCloseNotification = () => {
    setShowUnlockNotification(false);
  };

  const navigateToArtFeature = () => {
    setShowUnlockNotification(false);
    navigate("/stats#gen-art-section");
  };

  const handleDelete = async (id) => {
    try {
      await deleteEntry(id);
    } catch (error) {
      setError("Failed to delete entry");
    }
  };

  // helper function to find the appropriate icon for a given mood
  const getMoodIcon = (moodValue) => {
    const found = moods.find((m) => m.value === moodValue);
    return found?.iconUrl || "/src/assets/icons/moods/great.svg";
  };

  // helper functions to format date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <LoadingSpinner delay={500} />
      {/* if loading is done and we have entries, display them */}
      {!isLoading && entries.length > 0 && (
        <div className={styles["all-entries-container"]}>
          {entries.map((entry) => {
            const iconUrl = getMoodIcon(entry.mood);
            const dateText = formatDate(entry.date);
            const timeText = formatTime(entry.date);

            return (
              <div className={styles["entry-container"]} key={entry.id}>
                <div className={styles.mood}>
                  <img
                    className={styles.emoji}
                    src={iconUrl}
                    alt={`${entry.mood} emoji`}
                  />
                  <span>{entry.mood}</span>
                </div>

                <div className={styles["date-time"]}>
                  <h3 className={styles.date}>{dateText}</h3>
                  <div className={styles.time}>{timeText}</div>
                </div>

                <ul className={styles["mood-tags"]}>
                  {entry.emotions?.map((emotion, idx) => (
                    <li
                      key={`emotions-${entry.id}-${idx}`}
                      className={styles["mood-tag"]}
                    >
                      {emotion}
                    </li>
                  ))}
                  {entry.sleep?.map((sleep, idx) => (
                    <li
                      key={`sleep-${entry.id}-${idx}`}
                      className={styles["mood-tag"]}
                    >
                      {sleep}
                    </li>
                  ))}
                  {entry.productivity?.map((productivity, idx) => (
                    <li
                      key={`productivity-${entry.id}-${idx}`}
                      className={styles["mood-tag"]}
                    >
                      {productivity}
                    </li>
                  ))}
                </ul>
                <div className={styles["update-delete-container"]}>
                  <button
                    onClick={() => navigate(`/entry/${entry.id}`)}
                    className={styles["update-btn"]}
                    aria-label="Update Mood Entry"
                  ></button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className={styles["delete-btn"]}
                    aria-label="Delete Mood Entry"
                  ></button>
                </div>
                {/* TODO: render other fields like entry.note or entry.photoUrl here */}
              </div>
            );
          })}
        </div>
      )}
      <NotificationModal
        isOpen={showUnlockNotification}
        onClose={handleCloseNotification}
        title="Art Generation Unlocked!"
        message="Great job! You've logged 5 moods and unlocked something magical—your very own Art Piece! Go check it out on your dashboard. 🌟"
        actionText="View Now"
        onAction={navigateToArtFeature}
      />

      {/* if loading is done but no entries were returned, show a fallback message */}
      {!isLoading && entries.length === 0 && (
        <div className={styles["no-entries"]}>No entries found.</div>
      )}

      {entries.length > 0 ? (
        <>
          <div className={styles["first-entry-indicator"]}>
            &#9650;
            <span>This was your first entry</span>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Entries;
