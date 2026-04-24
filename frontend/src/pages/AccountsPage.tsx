import { useCallback, useMemo, useState } from "react";
import {
  Landmark,
  Wallet,
  CreditCard,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  MoreHorizontal,
  WalletCards,
} from "lucide-react";
import { useGetAccountsByOrgId } from "@/features/account/hooks/useGetAccountsByOrgId";
import useOrgStore from "@/store/orgStore";
import type { Account } from "@/features/account/types";
import CreateAccountModal from "@/components/CreateAccountModal";
import axios from "axios";
import { useCreateAccount } from "@/features/account/hooks/useCreateAccount";
import { useGetAllCurrencies } from "@/features/currency/hooks/useGetAllCurrencies";
import AccountsActionMenu from "@/components/AccountsActionMenu";
import EditAccountModal from "@/components/accounts/EditAccountModal";
import { useUpdateAccount } from "@/features/account/hooks/useUpdateAccount";
import DeleteAccountModal from "@/components/accounts/DeleteAccountModal";
import { useDeleteAccount } from "@/features/account/hooks/useDeleteAccount";
import StatusMessage from "@/components/StatusMessage";

type AccountsPageProps = {
  onRowClick?: (account: Account) => void;
};

export default function AccountsPage({ onRowClick }: AccountsPageProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id ?? "";

  const {
    data: accountsList = [],
    loading,
    error,
  } = useGetAccountsByOrgId(orgId);
  const accounts = Array.isArray(accountsList) ? accountsList : [];

  const {
    data: currencyList = [],
    isLoading,
    error: currencyError,
  } = useGetAllCurrencies();

  const [CreateAccountOpen, setCreateAccountOpen] = useState(false);
  const [createAccountError, setCreateAccountError] = useState("");
  const createAccountMutation = useCreateAccount(orgId);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const [deleteAccountError, setDeleteAccountError] = useState("");
  const deleteAccountMutation = useDeleteAccount(orgId);

  const [updateAccountError, setUpdateAccountError] = useState("");
  const updateAccountMutation = useUpdateAccount(orgId);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        account.name.toLowerCase().includes(search.toLowerCase()) ||
        account.currency_name.toLowerCase().includes(search.toLowerCase()) ||
        account.description?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        selectedType === "all" ? true : account.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [accounts, search, selectedType]);

  const stats = useMemo(() => {
    const totalAccounts = accounts.length;
    const positiveAccounts = accounts.filter(
      (a) => parseFloat(a.net_balance) >= 0,
    ).length;
    const negativeAccounts = accounts.filter(
      (a) => parseFloat(a.net_balance) < 0,
    ).length;
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + parseFloat(acc.net_balance),
      0,
    );

    return {
      totalAccounts,
      positiveAccounts,
      negativeAccounts,
      totalBalance,
    };
  }, [accounts]);

  const handleMenuClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, accId: string) => {
      e.stopPropagation();
      setMenuOpen(accId);
      setAnchorEl(e.currentTarget);
    },
    [],
  );

  const handleEdit = useCallback((account: Account) => {
    setMenuOpen(null);
    setSelectedAccount(account);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((account: Account) => {
    setMenuOpen(null);
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-gray-500">Loading accounts…</span>
      </div>
    );
  }

  if (currencyError) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-red-500">
          Error: {currencyError?.message ?? String(currencyError)}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Manage your organization accounts, monitor balances, and keep
              financial records organized.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateAccountOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Create Account
          </button>

          <CreateAccountModal
            open={CreateAccountOpen}
            onClose={() => {
              setCreateAccountOpen(false);
              setCreateAccountError("");
            }}
            loading={createAccountMutation.isPending}
            errorMessage={createAccountError}
            currencies={currencyList}
            onSubmit={async (data) => {
              try {
                setCreateAccountError("");
                await createAccountMutation.mutateAsync(data);
                setCreateAccountOpen(false);
              } catch (error) {
                let message = "Something went wrong, try again";

                if (axios.isAxiosError(error)) {
                  message = error?.response?.data?.error || message;
                }

                setCreateAccountError(message);
              }
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <StatusMessage
            type="error"
            message={
              typeof error?.message === "string"
                ? error.message
                : "An unexpected error occurred"
            }
          />
        )}

        {/* Top Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Accounts"
            value={String(stats.totalAccounts)}
            icon={<Landmark className="h-5 w-5" />}
          />
          <StatCard
            title="Healthy Accounts"
            value={String(stats.positiveAccounts)}
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <StatCard
            title="Attention Needed"
            value={String(stats.negativeAccounts)}
            icon={<ArrowDownLeft className="h-5 w-5" />}
          />
          <StatCard
            title="Net Balance"
            value={formatMoney(stats.totalBalance, "USD")}
            icon={<Wallet className="h-5 w-5" />}
            highlight
          />
        </div>

        {/* Toolbar */}
        <div className="mb-6 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                />
              </div>

              <div className="relative w-full sm:w-56">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <option value="all">All Types</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="credit">Credit</option>
                  <option value="wallet">Wallet</option>
                  <option value="savings">Savings</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredAccounts.length}
              </span>{" "}
              account{filteredAccounts.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="rounded-3xl border border-border bg-card/80 shadow-sm">
          <div className="border-b border-border px-6 py-5 md:px-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Account Directory</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review balances, categories, and account health at a glance.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 px-6 py-6 md:px-8">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-border">
                  <tr className="text-sm text-muted-foreground">
                    <th className="px-6 py-4 font-medium md:px-8">Account</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Currency</th>
                    <th className="px-6 py-4 font-medium">Initial Balance</th>
                    <th className="px-6 py-4 font-medium">Net Balance</th>
                    <th className="px-6 py-4 font-medium text-right md:px-8">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr
                      key={account.id}
                      onClick={() => onRowClick?.(account)}
                      className="cursor-pointer border-b border-border/60 transition hover:bg-muted/40"
                    >
                      <td className="px-6 py-4 md:px-8">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <AccountTypeIcon type={account.type} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {account.name}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {account.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <AccountTypeBadge type={account.type} />
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground">
                        {account.currency_symbol}
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground">
                        {formatMoney(
                          parseFloat(account.initial_balance),
                          account.currency_code,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            parseFloat(account.net_balance) < 0
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {formatMoney(
                            parseFloat(account.net_balance),
                            account.currency_code,
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right md:px-8">
                        <button
                          type="button"
                          onClick={(e) => handleMenuClick(e, account.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <AccountsActionMenu
                          open={menuOpen == account.id}
                          anchorRef={
                            anchorEl ? { current: anchorEl } : { current: null }
                          }
                          onClose={() => setMenuOpen(null)}
                          onEdit={() => handleEdit(account)}
                          onDelete={() => handleDelete(account)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <EditAccountModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            account={selectedAccount}
            onSubmit={async (data) => {
              try {
                setUpdateAccountError("");
                await updateAccountMutation.mutateAsync({
                  accountId: selectedAccount?.id ?? "",
                  data,
                });
                setEditModalOpen(false);
              } catch (error) {
                let message = "Something went wrong, try again";
                if (axios.isAxiosError(error)) {
                  message = error?.response?.data?.error || message;
                }
                setUpdateAccountError(message);
              }
            }}
            loading={updateAccountMutation.isPending}
            errorMessage={updateAccountError}
          />

          <DeleteAccountModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            account={accountToDelete}
            onConfirm={async (account) => {
              try {
                setDeleteAccountError("");
                await deleteAccountMutation.mutateAsync(account.id);
                setDeleteModalOpen(false);
              } catch (error) {
                let message = "Something went wrong, try again";
                if (axios.isAxiosError(error)) {
                  message = error?.response?.data?.error || message;
                }
                setDeleteAccountError(message);
              }
            }}
            loading={deleteAccountMutation.isPending}
            errorMessage={deleteAccountError}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? "border-primary/20 bg-primary/10"
          : "border-border bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function AccountTypeBadge({ type }: { type: Account["type"] }) {
  const styles: Record<Account["type"], string> = {
    cash: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bank: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    credit: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    wallet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    savings: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    other: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${styles[type]}`}
    >
      {type}
    </span>
  );
}

function AccountTypeIcon({ type }: { type: Account["type"] }) {
  switch (type) {
    case "cash":
      return <Wallet className="h-5 w-5" />;
    case "bank":
      return <Landmark className="h-5 w-5" />;
    case "credit":
      return <CreditCard className="h-5 w-5" />;
    case "wallet":
      return <WalletCards className="h-5 w-5" />;
    case "other":
      return <MoreHorizontal className="h-5 w-5" />;
    default:
      return <Wallet className="h-5 w-5" />;
  }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center md:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Landmark className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-xl font-semibold text-foreground">
        No accounts found
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Start by creating your first account to track balances, categorize
        transactions, and power your financial dashboard.
      </p>
    </div>
  );
}

function SkeletonRow() {
  return <div className="h-16 animate-pulse rounded-2xl bg-muted/50" />;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
