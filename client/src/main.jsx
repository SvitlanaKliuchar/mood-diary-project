import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthProvider, { AuthContext } from "./contexts/AuthContext.jsx";
import { EntriesProvider } from "./contexts/EntriesContext.jsx";
import { LoadingProvider } from "./contexts/LoadingContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <LoadingProvider>
      <EntriesProvider>
        <App />
      </EntriesProvider>
    </LoadingProvider>
  </AuthProvider>,
);
