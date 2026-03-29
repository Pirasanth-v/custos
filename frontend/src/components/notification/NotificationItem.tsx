import { Building2, Check, X, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import type { InvitationResponse } from "@/features/notifications/types";

type Props = {
  invitation: InvitationResponse;

  // hooks passed from parent
  onAccept: (inv: InvitationResponse) => Promise<void>;
  onDecline: (inv: InvitationResponse) => Promise<void>;
};

export default function NotificationItem({
  invitation,
  onAccept,
  onDecline,
}: Props) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [handled, setHandled] = useState(false);

  const handleAction = async (type: "accept" | "decline") => {
    try {
      setLoading(type);

      if (type === "accept") {
        await onAccept(invitation);
      } else {
        await onDecline(invitation);
      }

      setHandled(true); // hide or mark completed
    } finally {
      setLoading(null);
    }
  };

  if (handled) {
    return (
      <div className="px-5 py-4 border-b border-white/5 text-sm text-muted-foreground/60">
        Invitation handled
      </div>
    );
  }

  return (
    <div className="px-5 py-4 border-b border-white/5 hover:bg-white/5 flex gap-3 items-start">
      
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Building2 size={18} className="text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          Organization Invitation
        </p>

        <p className="text-xs text-foreground/60 mt-1">
          Join{" "}
          <span className="text-foreground font-medium">
            {invitation.org_name}
          </span>{" "}
          as{" "}
          <span className="text-primary font-medium">
            {invitation.role_name}
          </span>
        </p>

        {/* Time */}
        <div className="flex items-center gap-1 mt-2 text-xs text-foreground/50">
          <Clock size={12} />
          {formatTime(invitation.invited_at)}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleAction("accept")}
            disabled={loading !== null}
            className="flex items-center text-white gap-1 px-3 py-1 rounded-md bg-success hover:bg-success/90 text-xs font-medium"
          >
            {loading === "accept" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            Accept
          </button>

          <button
            onClick={() => handleAction("decline")}
            disabled={loading !== null}
            className="flex items-center gap-1 px-3 py-1 rounded-md border border-foreground/10 hover:bg-foreground/10 text-xs"
          >
            {loading === "decline" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <X size={12} />
            )}
            Decline
          </button>
        </div>
      </div>

      {/* Unread dot */}
      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
    </div>
  );
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;

  return date.toLocaleDateString();
}