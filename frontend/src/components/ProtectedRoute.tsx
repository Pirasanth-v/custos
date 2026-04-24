import useAuthStore from "@/store/authStore";
import useOrgStore from "@/store/orgStore";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "@/features/auth/hooks/useMe";
import { useGetUserOrgs } from "@/features/organization/hooks/useGetUserOrgs";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { setUser } = useAuthStore();
  const { setCurrentOrg, setOrgs, currentOrg } = useOrgStore();

  const { data: user, isLoading: authLoading, isError: authError } = useMe();
  const { data: orgs, isLoading: orgsLoading } = useGetUserOrgs();

  // Sync state to stores when data changes
  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    if (orgs && orgs.length > 0) {
      setOrgs(orgs);

      // If no current org is selected, pick personal one as default
      if (!currentOrg) {
        const personal = orgs.find((o) => o.is_personal) || orgs[0];
        if (personal) setCurrentOrg(personal);
      }
    }
  }, [orgs, setOrgs, setCurrentOrg, currentOrg]);

  const loading = authLoading || orgsLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Initializing session...
          </p>
        </div>
      </div>
    );
  }

  if (authError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
