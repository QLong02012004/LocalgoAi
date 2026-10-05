import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ThemeProvider } from "./context/ThemeContext.tsx";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "35389148779-5q201oc5grq17f0934nosdlshqcqr8b8.apps.googleusercontent.com";

// Auto-seed default logged in user session if not present
if (!localStorage.getItem("user")) {
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: 1,
      email: "traveler@localgo.ai",
      fullName: "Thám hiểm viên",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      role: "USER",
      isActive: true,
      address: "Đà Nẵng, Việt Nam",
      createdAt: "2026-01-01T00:00:00Z",
      phone: "0905 123 456",
      bio: "Sẵn sàng lên lịch trình tự động đi du lịch muôn nơi với TravelAI",
      googleId: null,
      facebookId: null,
      isGoogleLinked: false,
      isFacebookLinked: false,
      isEmailVerified: true,
    })
  );
  localStorage.setItem("accessToken", "mock-token-travelai-2026");
  localStorage.setItem("username", "Thám hiểm viên");
  localStorage.setItem("avatar", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80");
  localStorage.setItem("surveyCompleted", "true");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
