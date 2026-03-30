import { useState, useMemo, useCallback } from "react";
import { useGetMembers } from "@/features/organizationMembers/hooks/useGetMembers";
import Table from "@/components/Table";
import InviteMembersModal from "@/components/InviteMemberModal";
import RemoveMemberModal from "@/components/RemoveMemberModal";
import EditRoleModal from "@/components/EditRoleModal";
import { Ellipsis, UserPlus } from "lucide-react";
import useOrgStore from "@/store/orgStore";
import MemberActionMenu from "@/components/MemberActionMenu";
import { useUpdateMemberRole } from "@/features/organizationMembers/hooks/useUpdateMemberRole";
import type { Member, updateMemberRoleRequest } from "@/features/organizationMembers/types";
import axios from "axios";
import { useRemoveMember } from "@/features/organizationMembers/hooks/useRemoveMember";

const MembersSettings = () => {
  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id ?? "";
  const { data: members = [], loading: isLoading, error } = useGetMembers(orgId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [ellipsisMenuOpen, setEllipsisMenuOpen] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [serverError, setServerError] = useState<string | null>(null)

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removeError, setRemoveError] = useState("");

  const updateMemberRoleMutation = useUpdateMemberRole(
    orgId,
    selectedMember?.user_id ?? ""
  );

  const removeMemberMutation = useRemoveMember();

  const headers = useMemo(() => ["Member", "Email", "Role", "Status", ""], []);

  const handleEllipsisClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, userId: string) => {
      e.stopPropagation();
      setEllipsisMenuOpen(userId);
      setAnchorEl(e.currentTarget);
    },
    []
  );

  const handleEdit = useCallback(
    (member: Member) => {
      setEllipsisMenuOpen(null);
      setSelectedMember(member);
      setEditModalOpen(true);
    },
    []
  );

  const handleDelete = useCallback((member: Member) => {
    setEllipsisMenuOpen(null);
    setMemberToRemove(member);
    setRemoveModalOpen(true);
  }, []);

  const renderRow = useCallback(
    (member: Member) => (
      <>
        <td className="px-4 py-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center uppercase">
            {member.first_name?.[0] || member.email?.[0] || "?"}
          </div>
          {member.first_name} {member.last_name}
        </td>
        <td className="px-4 py-3">{member.email}</td>
        <td className="px-4 py-3">{member.role_name || member.role_id}</td>
        <td className="px-4 py-3">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              member.status === "active"
                ? "bg-success/30 text-success"
                : member.status === "invited"
                ? "bg-primary/30 text-primary"
                : "bg-destructive/30 text-destructive"
            }`}
          >
            {member.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="relative">
            <button
              onClick={(e) => handleEllipsisClick(e, member.user_id)}
              className="cursor-pointer"
              aria-label="Open actions menu"
            >
              <Ellipsis size={18} />
            </button>
            <MemberActionMenu
              open={ellipsisMenuOpen === member.user_id}
              anchorRef={anchorEl ? { current: anchorEl } : undefined}
              onClose={() => setEllipsisMenuOpen(null)}
              onEdit={() => handleEdit(member)}
              onDelete={() => handleDelete(member)}
            />
          </div>
        </td>
      </>
    ),
    [ellipsisMenuOpen, anchorEl, handleEllipsisClick, handleEdit, handleDelete]
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading members</p>;

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-semibold">Team Members</h1>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg transition shadow"
        >
          <UserPlus size={18} />
          Invite Member
        </button>
      </div>

      <Table
        headers={headers}
        data={members}
        renderRow={renderRow}
        onRowClick={() => {}}
      />

      <InviteMembersModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      <EditRoleModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        member={selectedMember}
        onSave={async (roleId) => {
          if (!orgId || !selectedMember?.user_id) return;
          updateMemberRoleMutation.mutate(
            {
              member_id: selectedMember.user_id,
              role_id: roleId,
            } as updateMemberRoleRequest,
            {
              onSuccess: () => {
                setEditModalOpen(false);
              },
              onError: (err) => {
                let message = "Something went wrong, try again"
                if (axios.isAxiosError(err)) {
                  message = err?.response?.data?.error || message
                }
                setServerError(message)
              },
            }
          );
        }}
        err={serverError}
      />

      <RemoveMemberModal
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setRemoveError("");
        }}
        member={memberToRemove}
        loading={false}
        errorMessage={removeError}
        onConfirm={async (memberToRemove) => {
          try {
            setRemoveError("");
            await removeMemberMutation.mutateAsync({
              orgId: currentOrg?.id ?? "",
              userId: memberToRemove.user_id
            })
            setRemoveModalOpen(false);
          } catch (error) {
            let message = "Something went wrong. try again."
            if (axios.isAxiosError(error)) {
              message = error?.response?.data?.error || message
            }
            setRemoveError(message)
          }
        }}
      />
    </div>
  );
};

export default MembersSettings;