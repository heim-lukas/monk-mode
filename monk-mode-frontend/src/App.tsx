import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { LoginScreen } from "./components/login-screen";
import { SignUpScreen } from "./components/signup-screen";
import { Dashboard } from "./components/dashboard";
import { ProtectedRoute } from "./components/protected-route";
import { NotFound } from "./components/not-found";
import { signalRService } from "./services";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Initialize SignalR connection when user is authenticated
      signalRService.startConnection().catch((error) => {
        console.error("Failed to connect to SignalR:", error);
        // If token is invalid, redirect to login
        if (error.message.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
      
      // Cleanup
      return () => {
        signalRService.stopConnection();
      };
    }
  }, [navigate]);
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;