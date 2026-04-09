import { useMemo, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, RotateCcw } from "lucide-react";
import useOrgStore from "@/store/orgStore";
import type { Account } from "@/features/account/types";
import { useGetAccountsByOrgId } from "@/features/account/hooks/useGetAccountsByOrgId";
import type {
  Transaction,
  TransactionType,
} from "@/features/transaction/types";
import { useCreateTransaction } from "@/features/transaction/hooks/useCreateTransaction";
import { useGetTransactionsByOrgId } from "@/features/transaction/hooks/useGetTransactionsByOrgId";
import { useDeleteTransaction } from "@/features/transaction/hooks/useDeleteTransaction";
import { useUpdateTransaction } from "@/features/transaction/hooks/useUpdateTransaction";
import StatusMessage from "@/components/StatusMessage";
import TransactionsToolbar from "@/components/transactions/TransactionsToolbar";
import TransactionsTable from "@/components/transactions/TransactionsTable";
import TransactionsPagination from "@/components/transactions/TransactionsPagination";
import TransactionCreateModal from "@/components/transactions/TransactionCreateModal";
import TransactionEditModal from "@/components/transactions/TransactionEditModal";
import TransactionDeleteModal from "@/components/transactions/TransactionDeleteModal";

function SkeletonRow() {
  return <div className="h-16 animate-pulse rounded-2xl bg-muted/50" />;
}

function createAccountsById(accounts: Account[]): Record<string, Account> {
  return accounts.reduce(
    (acc, a) => {
      acc[a.id] = a;
      return acc;
    },
    {} as Record<string, Account>,
  );
}

export default function TransactionPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TransactionType | "all">("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id ?? "";

  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    data: accountsList = [],
    loading: accountsLoading,
    error: accountsError,
  } = useGetAccountsByOrgId(orgId);

  const accountsById = useMemo(() => {
    if (accountsLoading || !accountsList?.length) return undefined;
    return createAccountsById(accountsList);
  }, [accountsLoading, accountsList]);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTransactionsByOrgId(orgId, pageSize);

  const transactions: Transaction[] = useMemo(() => {
    if (!data?.pages?.length) return [];
    return data.pages.flatMap((p) => p.data ?? []);
  }, [data]);

  const visibleTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesType = type === "all" ? true : t.type === type;
      if (!matchesType) return false;
      if (!q) return true;

      const haystack = [t.id, t.type, t.amount, t.description ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [transactions, search, type]);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleTransactions.length / pageSize),
  );

  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return visibleTransactions.slice(start, end);
  }, [visibleTransactions, currentPage, pageSize]);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages || !!hasNextPage;

  const updateMutation = useUpdateTransaction(orgId);
  const deleteMutation = useDeleteTransaction(orgId);
  const createMutation = useCreateTransaction(orgId);

  const handleEdit = (t: Transaction) => {
    setEditError(null);
    setSelectedTransaction(t);
    setEditOpen(true);
  };

  const handleDelete = (t: Transaction) => {
    setDeleteError(null);
    setTransactionToDelete(t);
    setDeleteOpen(true);
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Transactions
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Track financial activity across your organization with fast,
              cursor-based pagination.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {accountsLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading accounts...
              </>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              disabled={
                accountsLoading || !orgId || (accountsList?.length ?? 0) === 0
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create Transaction
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6">
            <StatusMessage type="error" message={error.message} />
          </div>
        ) : null}

        {accountsError ? (
          <div className="mb-6">
            <StatusMessage
              type="error"
              message={
                typeof accountsError === "object"
                  ? ((accountsError as Error).message ?? String(accountsError))
                  : String(accountsError)
              }
            />
          </div>
        ) : null}

        <TransactionsToolbar
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
        />

        <div className="rounded-3xl border border-border bg-card/80 shadow-sm">
          <div className="border-b border-border px-6 py-5 md:px-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Transaction Feed</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Showing your most recent transactions first.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Page size</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 px-6 py-6 md:px-8">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : visibleTransactions.length === 0 ? (
            <div className="px-6 py-16 text-center md:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                No transactions found
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Try adjusting your search/filter, or load more results to
                continue browsing.
              </p>
            </div>
          ) : (
            <div className="px-6 py-6 md:px-8">
              <TransactionsTable
                transactions={paginatedTransactions}
                accountsById={accountsById}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              <TransactionsPagination
                totalLoaded={transactions.length}
                visibleCount={paginatedTransactions.length}
                currentPage={effectivePage}
                totalPages={totalPages}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                isFetchingNextPage={isFetchingNextPage}
                onPrev={() => {
                  if (!canGoPrev) return;
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                onNext={async () => {
                  if (effectivePage < totalPages) {
                    setCurrentPage((p) => p + 1);
                    return;
                  }
                  if (hasNextPage) {
                    const res = await fetchNextPage();
                    const fetched =
                      (res.data?.pages?.at(-1)?.data?.length ?? 0) > 0;
                    if (fetched) setCurrentPage((p) => p + 1);
                  }
                }}
              />
            </div>
          )}

          <TransactionEditModal
            key={editOpen ? "edit-open" : "edit-closed"}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            transaction={selectedTransaction}
            accounts={accountsList as Account[]}
            loading={updateMutation.isPending}
            errorMessage={editError ?? updateMutation.error?.message ?? null}
            onSubmit={async ({ tranId, fromAccountId, data }) => {
              try {
                setEditError(null);
                await updateMutation.mutateAsync({
                  tranId,
                  fromAccountId,
                  data,
                });
                queryClient.invalidateQueries({
                  queryKey: ["org", orgId, "transactions"],
                });
                setEditOpen(false);
              } catch (err) {
                let message = "Something went wrong, try again";
                if (axios.isAxiosError(err)) {
                  message = err.response?.data?.error || message;
                }
                setEditError(message);
              }
            }}
          />

          <TransactionCreateModal
            key={createOpen ? "create-open" : "create-closed"}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            accounts={accountsList as Account[]}
            loading={createMutation.isPending}
            errorMessage={createError ?? createMutation.error?.message ?? null}
            onSubmit={async ({ fromAccountId, data }) => {
              try {
                setCreateError(null);
                await createMutation.mutateAsync({ fromAccountId, data });
                queryClient.invalidateQueries({
                  queryKey: ["org", orgId, "transactions"],
                });
                setCreateOpen(false);
              } catch (err) {
                let message = "Something went wrong, try again";
                if (axios.isAxiosError(err)) {
                  message = err.response?.data?.error || message;
                }
                setCreateError(message);
              }
            }}
          />

          <TransactionDeleteModal
            key={deleteOpen ? "delete-open" : "delete-closed"}
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            transaction={transactionToDelete}
            loading={deleteMutation.isPending}
            errorMessage={deleteError ?? deleteMutation.error?.message ?? null}
            onConfirm={async ({ tranId, fromAccountId }) => {
              try {
                setDeleteError(null);
                await deleteMutation.mutateAsync({ tranId, fromAccountId });
                queryClient.invalidateQueries({
                  queryKey: ["org", orgId, "transactions"],
                });
                setDeleteOpen(false);
              } catch (err) {
                let message = "Something went wrong, try again";
                if (axios.isAxiosError(err)) {
                  message = err.response?.data?.error || message;
                }
                setDeleteError(message);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
