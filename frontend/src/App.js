import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ServerDashboardPage from "./pages/ServerDashboardPage";
import TicketsPage from "./pages/TicketsPage";
import TranscriptPage from "./pages/TranscriptPage";
import ConfigPage from "./pages/ConfigPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/server/:serverId" element={<ProtectedRoute><ServerDashboardPage /></ProtectedRoute>} />
          <Route path="/server/:serverId/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/server/:serverId/transcript/:ticketId" element={<ProtectedRoute><TranscriptPage /></ProtectedRoute>} />
          <Route path="/server/:serverId/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(26, 10, 10, 0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 51, 51, 0.25)",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

export default App;
