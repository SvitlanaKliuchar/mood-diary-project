import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Calendar from "./pages/Calendar.jsx";
import Settings from "./pages/Settings.jsx";
import Stats from "./pages/Stats.jsx";
import Entry from "./pages/Entry.jsx";
import Home from "./pages/Home.jsx";
import "./App.css";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoadingSpinner from "./components/loading/LoadingSpinner.jsx";

function App() {
  return (
    <>
    <LoadingSpinner />
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/home" element={<Home />} />
        <Route path="/entry" element={<Entry />} />
        <Route path="/entry/:id" element={<Entry />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;
