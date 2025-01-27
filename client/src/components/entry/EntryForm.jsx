import React, { useState } from "react";
import axios from "axios";
import EntryMoodDate from "./EntryMoodDate.jsx";
import EntryMain from "./EntryMain.jsx";
import SubmitButton from "./form-elements/SubmitButton.jsx";
import styles from "./EntryForm.module.css";

const EntryForm = () => {
  //form state
  const [date, setDate] = useState(new Date());
  const [mood, setMood] = useState("");
  const [emotions, setEmotions] = useState([]);
  const [sleep, setSleep] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);

  //submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  //handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    //basic validation TODO: implement robust validation both client and server side
    if (!date || !mood) {
      setError("Please select both date and mood.");
      setLoading(false);
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
      //call api
      const response = await axios.post("/api/entry", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Entry added successfully!");

      //reset form fields
      setDate(new Date());
      setMood("");
      setEmotions([]);
      setSleep([]);
      setProductivity([]);
      setNote("");
      setPhoto(null);
      // TODO: trigger a refresh or update to the entries list on the home page
      // this could be done via state lifting, Context API, or other state management solutions
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occured while submitting your entry",
      );
    } finally {
      setLoading(false);
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

      <SubmitButton loading={loading} />

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
};

export default EntryForm;
