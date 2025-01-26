import React from "react";
import NavBar from "../components/landing/NavBar.jsx";
import EntryHeader from "../components/entry/EntryHeader.jsx";
import EntryMain from "../components/entry/EntryMain.jsx";
import Footer from "../components/landing/Footer.jsx";

const Login = () => {
  return (
    <>
      <NavBar />
      <EntryHeader />
      <EntryMain />
      <Footer />
    </>
  );
};

export default Login;
