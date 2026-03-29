import Dropdown from "../dropdown/Dropdown";
import { Bell } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { useGetInvitations } from "@/features/notifications/hooks/useGetInvitations";
import { useAcceptInvitation } from "@/features/notifications/hooks/useAcceptInvitation";
import { useDeclineInvitation } from "@/features/notifications/hooks/useDeclineInvitation";
import { useMemo, useState } from "react";
import type { GetInvitationsResult } from "@/features/notifications/types";

export default function Notifications() {
  const {
    data: invitations,
    loading,
    error,
    refetch,
  }: GetInvitationsResult = useGetInvitations();

  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  const [handledOrgIds, setHandledOrgIds] = useState<string[]>([]);

  const visibleInvitations = useMemo(() => {
    return (invitations ?? []).filter(
      (inv) => !handledOrgIds.includes(inv.org_id)
    );
  }, [invitations, handledOrgIds]);

  const unreadCount = visibleInvitations.length;

  const handleAccept = async (orgId: string) => {
    setHandledOrgIds((prev) => [...prev, orgId]); // optimistic UI

    try {
      await acceptMutation.mutateAsync(orgId);
      refetch();
    } catch (error) {
      setHandledOrgIds((prev) => prev.filter((id) => id !== orgId)); // rollback
      throw error;
    }
  };

  const handleDecline = async (orgId: string) => {
    setHandledOrgIds((prev) => [...prev, orgId]); // optimistic UI

    try {
      await declineMutation.mutateAsync(orgId);
      refetch();
    } catch (error) {
      setHandledOrgIds((prev) => prev.filter((id) => id !== orgId)); // rollback
      throw error;
    }
  };

  return (
    <Dropdown
      widthClass="w-[360px]"
      trigger={
        <button className="relative flex">
          <Bell size={20} />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-destructive text-white rounded-full px-1.5">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Notifications</h3>
          <button className="text-sm text-primary hover:underline">
            Mark all as read
          </button>
        </div>

        {unreadCount > 0 && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            Loading...
          </p>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-6">
            Error loading notifications.
          </p>
        ) : visibleInvitations.length ? (
          visibleInvitations.map((inv) => (
            <NotificationItem
              key={inv.org_id}
              invitation={inv}
              onAccept={async () => {
                await handleAccept(inv.org_id);
              }}
              onDecline={async () => {
                await handleDecline(inv.org_id);
              }}
            />
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-6">
            No notifications
          </p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-border flex justify-between items-center">
        <button className="text-sm text-muted-foreground hover:text-foreground">
          Clear all
        </button>

        <button className="px-4 py-1.5 rounded-lg border border-border hover:bg-muted text-sm">
          View All
        </button>
      </div>
    </Dropdown>
  );
}