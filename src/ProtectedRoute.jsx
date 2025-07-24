import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate("/", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return children;
}

export default ProtectedRoute;
