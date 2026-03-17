import useAuthStore from "@/store/authStore";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { me } from "@/features/auth/api";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div> Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
