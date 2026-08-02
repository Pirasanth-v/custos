import { useState, useMemo, useCallback } from "react";
import { useGetMembers } from "@/features/organizationMembers/hooks/useGetMembers";
import Table from "@/components/Table";
import InviteMembersModal from "@/components/InviteMemberModal";
import RemoveMemberModal from "@/components/RemoveMemberModal";
import EditRoleModal from "@/components/EditRoleModal";
import { Ellipsis, UserPlus, Pencil, Trash2 } from "lucide-react";
import useOrgStore from "@/store/orgStore";
import { useUpdateMemberRole } from "@/features/organizationMembers/hooks/useUpdateMemberRole";
import type { Member, updateMemberRoleRequest } from "@/features/organizationMembers/types";
import axios from "axios";
import { useRemoveMember } from "@/features/organizationMembers/hooks/useRemoveMember";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MembersSettings = () => {
  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id ?? "";
  const { data: members = [], loading: isLoading, error } = useGetMembers(orgId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

  const handleEdit = useCallback(
    (member: Member) => {
      setSelectedMember(member);
      setEditModalOpen(true);
    },
    []
  );

  const handleDelete = useCallback((member: Member) => {
    setMemberToRemove(member);
    setRemoveModalOpen(true);
  }, []);

  const renderRow = useCallback(
    (member: Member) => (
      <>
        <td className="min-w-0 overflow-hidden px-2 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium uppercase text-white">
              {member.first_name?.[0] || member.email?.[0] || "?"}
            </div>

            <div className="min-w-0">
              <p className="block max-w-full truncate font-medium text-foreground">
                {[member.first_name, member.last_name].filter(Boolean).join(" ") ||
                  member.email}
              </p>

              <p className="block max-w-full truncate text-xs text-muted-foreground lg:hidden">
                {member.email}
              </p>

              <p className="block max-w-full truncate text-xs text-muted-foreground md:hidden">
                {member.role_name || member.role_id}
              </p>
            </div>
          </div>
        </td>
        <td className="hidden px-4 py-3 lg:table-cell">
          <span className="block max-w-xs truncate">{member.email}</span>
        </td>
        <td className="hidden px-4 py-3 md:table-cell">
          {member.role_name || member.role_id}
        </td>
        <td className="w-[78px] px-1 py-3 text-center sm:w-[100px] sm:px-4">
          <span
            className={`inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-full px-1.5 py-1 text-[10px] font-medium capitalize sm:px-3 sm:text-sm ${member.status === "active"
              ? "bg-success/30 text-success"
              : member.status === "invited"
                ? "bg-primary/30 text-primary"
                : "bg-destructive/30 text-destructive"
              }`}
          >
            {member.status}
          </span>
        </td>
        <td className="w-[44px] whitespace-nowrap px-1 py-3 text-center sm:w-[60px] sm:px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={`Actions for ${member.first_name || member.email}`}
              >
                <Ellipsis size={18} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="w-44"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenuItem
                onSelect={() => handleEdit(member)}
                className="cursor-pointer gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Role
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => handleDelete(member)}
                className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </>
    ),
    [handleEdit, handleDelete]
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading members</p>;

  return (
    <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Team Members</h1>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white shadow transition hover:bg-primary/90 sm:w-auto"
        >
          <UserPlus size={18} />
          Invite Member
        </button>
      </div>

      <div
        className="
    min-w-0 overflow-hidden
    [&_table]:w-full
    [&_table]:table-fixed

    [&_th:nth-child(2)]:hidden
    lg:[&_th:nth-child(2)]:table-cell

    [&_th:nth-child(3)]:hidden
    md:[&_th:nth-child(3)]:table-cell

    [&_th:nth-child(4)]:w-[78px]
    sm:[&_th:nth-child(4)]:w-[100px]

    [&_th:nth-child(5)]:w-[44px]
    sm:[&_th:nth-child(5)]:w-[60px]
  "
      >
        <Table
          headers={headers}
          data={members}
          renderRow={renderRow}
          onRowClick={() => { }}
        />
      </div>

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