import React, { useContext, useEffect, useState } from "react";
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
    }
  }, [id, isEditing, entries]);

  //handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();
    setError(null);
    setSuccess(null);

    //basic validation
    //TODO: implement robust validation both client and server side
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

        navigate("/home");
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

        //reset form fields
        setDate(new Date());
        setMood("");
        setEmotions([]);
        setSleep([]);
        setProductivity([]);
        setNote("");
        setPhoto(null);

        //navigate to home page after successful submission
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occured while submitting your entry",
      );
    } finally {
      finishLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles["entry-form"]}>
      <EntryMoodDate
        date={date}
        setDate={setDate}
        mood={mood}
        setMood={setMood}
      />

      <EntryMain
        emotions={emotions}
        setEmotions={setEmotions}
        sleep={sleep}
        setSleep={setSleep}
        productivity={productivity}
        setProductivity={setProductivity}
        note={note}
        setNote={setNote}
        photo={photo}
        setPhoto={setPhoto}
      />

      <SubmitButton />

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
};

export default EntryForm;
