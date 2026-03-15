import { logout } from "@/features/auth/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error && <p>{error}</p>}
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
