import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthProvider, { AuthContext } from "./contexts/AuthContext.jsx";
import { EntriesProvider } from "./contexts/EntriesContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <EntriesProvider>
      <App />
    </EntriesProvider>
  </AuthProvider>,
);
