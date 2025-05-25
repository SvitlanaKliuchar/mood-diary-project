import React, { useContext, useEffect, useState, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance.js";
import EntryMoodDate from "./EntryMoodDate.jsx";
import EntryMain from "./EntryMain.jsx";
import SubmitButton from "./form-elements/SubmitButton.jsx";
import styles from "./EntryForm.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { EntriesContext } from "../../contexts/EntriesContext.jsx";
import { LoadingContext } from "../../contexts/LoadingContext.jsx";

const EntryForm = () => {
  const { id } = useParams();
  const isEditing = !!id; //true if id is present, false if not

  const navigate = useNavigate();
  const { addEntry, entries, updateEntry } = useContext(EntriesContext);
  const { startLoading, finishLoading } = useContext(LoadingContext);

  //form state
  const [date, setDate] = useState(new Date());
  const [mood, setMood] = useState("");
  const [emotions, setEmotions] = useState([]);
  const [sleep, setSleep] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);

  //submission state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // function to reset form to initial state
  const resetForm = useCallback(() => {
    setDate(new Date());
    setMood("");
    setEmotions([]);
    setSleep([]);
    setProductivity([]);
    setNote("");
    setPhoto(null);
    setError(null);
    setSuccess(null);
  }, []);

  // reset form on component mount (unless editing)
  useEffect(() => {
    if (!isEditing) {
      resetForm();
    }
  }, [isEditing, resetForm]);

  // clear messages when user starts interacting
  const clearMessages = useCallback(() => {
    if (error) setError(null);
    if (success) setSuccess(null);
  }, [error, success]);

  //if editing, preload existing data
  useEffect(() => {
    if (!isEditing) return;

    //the entry is already in context (entries)
    const existingEntry = entries.find((e) => e.id === Number(id));

    if (existingEntry) {
      //populate local state
      setDate(new Date(existingEntry.date));
      setMood(existingEntry.mood);
      setEmotions(existingEntry.emotions || []);
      setSleep(existingEntry.sleep || []);
      setProductivity(existingEntry.productivity || []);
      setNote(existingEntry.note || "");
      setPhoto(null);
      setError(null);
      setSuccess(null);
    }
  }, [id, isEditing, entries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();
    setError(null);
    setSuccess(null);

    //basic validation
    if (!date || !mood) {
      setError("Please select both date and mood.");
      finishLoading();
      return;
    }

    //prepare form data
    const formData = new FormData();
    formData.append("date", date.toISOString());
    formData.append("mood", mood);
    formData.append("emotions", JSON.stringify(emotions));
    formData.append("sleep", JSON.stringify(sleep));
    formData.append("productivity", JSON.stringify(productivity));
    formData.append("note", note);
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      if (isEditing) {
        await updateEntry(id, formData);
        setSuccess("Entry updated successfully!");

        // delay navigation to show success message
        setTimeout(() => {
          navigate("/home", { replace: true }); // prevent back navigation to form
        }, 1500); // show success message for 1.5 seconds
      } else {
        const response = await axiosInstance.post("/moods", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setSuccess("Entry added successfully!");

        const { mood: newMood } = response.data;

        //add the new entry to the context
        addEntry(newMood);

        setTimeout(() => {
          resetForm(); // Reset form first
          navigate("/home", { replace: true }); // Then navigate
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while submitting your entry",
      );
    } finally {
      finishLoading();
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    clearMessages();
  };

  const handleMoodChange = (newMood) => {
    setMood(newMood);
    clearMessages();
  };

  const handleEmotionsChange = (newEmotions) => {
    setEmotions(newEmotions);
    clearMessages();
  };

  const handleSleepChange = (newSleep) => {
    setSleep(newSleep);
    clearMessages();
  };

  const handleProductivityChange = (newProductivity) => {
    setProductivity(newProductivity);
    clearMessages();
  };

  const handleNoteChange = (newNote) => {
    setNote(newNote);
    clearMessages();
  };

  const handlePhotoChange = (newPhoto) => {
    setPhoto(newPhoto);
    clearMessages();
  };

  return (
    <form onSubmit={handleSubmit} className={styles["entry-form"]}>
      <EntryMoodDate
        date={date}
        setDate={handleDateChange}
        mood={mood}
        setMood={handleMoodChange}
      />

      <EntryMain
        emotions={emotions}
        setEmotions={handleEmotionsChange}
        sleep={sleep}
        setSleep={handleSleepChange}
        productivity={productivity}
        setProductivity={handleProductivityChange}
        note={note}
        setNote={handleNoteChange}
        photo={photo}
        setPhoto={handlePhotoChange}
      />

      <SubmitButton />

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
};

export default EntryForm;
