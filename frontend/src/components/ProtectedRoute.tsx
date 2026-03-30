import useAuthStore from "@/store/authStore";
import useOrgStore from "@/store/orgStore";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { me } from "@/features/auth/api";
import { getUserOrgs } from "@/features/organization/api";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { user, setUser } = useAuthStore();
  const { setCurrentOrg, setOrgs } = useOrgStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then(async (user) => {
        setUser(user);
        // load orgs
        const orgs = await getUserOrgs();
        setOrgs(orgs);
        // set personal org as default
        const personal = orgs.find((o) => o.is_personal);
        if (personal) setCurrentOrg(personal);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [setCurrentOrg, setOrgs, setUser]);

  if (loading) {
    return <div> Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
