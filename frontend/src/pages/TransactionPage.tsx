import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, RotateCcw } from "lucide-react";
import useOrgStore from "@/store/orgStore";
import type { Account } from "@/features/account/types";
import { useGetAccountsByOrgId } from "@/features/account/hooks/useGetAccountsByOrgId";
import type { Category } from "@/features/category/types";
import { useGetCategoriesByOrgId } from "@/features/category/hooks/useGetCategoriesByOrgId";
import type {
  Transaction,
  TransactionFilters,
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
import { useGetPresignURL } from "@/features/bills/hooks/useGetPresignURL";
import {
  type ConfirmBillInput,
  type PresignFileInput,
} from "@/features/bills/types";
import { useConfirmUploads } from "@/features/bills/hooks/useConfirmUploads";
import { useBillsByTransaction } from "@/features/bills/hooks/useGetBillsByTransaction";
import { useDeleteBill } from "@/features/bills/hooks/useDeleteBill";
import TransactionDetailModal from "@/components/transactions/detail/TransactionDetailModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function createCategoriesById(
  categories: Category[],
): Record<string, Category> {
  return categories.reduce(
    (acc, category) => {
      acc[category.id] = category;
      return acc;
    },
    {} as Record<string, Category>,
  );
}

export default function TransactionPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    type: "all",
    account_ids: [],
    category_ids: [],
    sort_key: "date",
    sort_dir: "desc",
  });
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

  const [viewOpen, setViewOpen] = useState(false);

  const [pendingTxId, setPendingTxId] = useState<string | "">("");

  const selectedTransactionId = selectedTransaction?.id ?? "";
  const { data: existingBills = [] } = useBillsByTransaction(
    orgId,
    selectedTransactionId,
  );

  const {
    data: accountsData,
    loading: accountsLoading,
    error: accountsError,
  } = useGetAccountsByOrgId(orgId);
  const accountsList = accountsData ?? [];

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesByOrgId(orgId);
  const categoriesList = categoriesData ?? [];

  const accountsById = useMemo(() => {
    if (accountsLoading || !accountsList?.length) return undefined;
    return createAccountsById(accountsList);
  }, [accountsLoading, accountsList]);
  const categoriesById = useMemo(() => {
    if (categoriesLoading || !categoriesList?.length) return undefined;
    return createCategoriesById(categoriesList);
  }, [categoriesLoading, categoriesList]);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTransactionsByOrgId(orgId, pageSize, filters);

  const transactions: Transaction[] = useMemo(() => {
    if (!data?.pages?.length) return [];
    return data.pages.flatMap((p) => p.data ?? []);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));

  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return transactions.slice(start, end);
  }, [transactions, currentPage, pageSize]);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages || !!hasNextPage;

  const updateMutation = useUpdateTransaction(orgId);
  const deleteMutation = useDeleteTransaction(orgId);
  const createMutation = useCreateTransaction(orgId);

  const presignMutation = useGetPresignURL(orgId);
  const confirmMutation = useConfirmUploads(orgId);
  const { mutateAsync: deleteBillMutation, isPending: isDeleting } =
    useDeleteBill(orgId, selectedTransactionId);

  const handleView = (t: Transaction) => {
    setSelectedTransaction(t);
    setViewOpen(true);
  };

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
    <div className="min-h-full min-w-0 bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Transactions
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:mt-2 md:text-base">
              Track financial activity across your organization
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end">
            <div className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              {accountsLoading ? (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Loading accounts...
                </span>
              ) : null}
              {categoriesLoading ? (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Loading categories...
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              disabled={
                accountsLoading ||
                categoriesLoading ||
                !orgId ||
                (accountsList?.length ?? 0) === 0 ||
                (categoriesList?.length ?? 0) === 0
              }
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5"
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
        {categoriesError ? (
          <div className="mb-6">
            <StatusMessage
              type="error"
              message={
                typeof categoriesError === "object"
                  ? ((categoriesError as Error).message ??
                    String(categoriesError))
                  : String(categoriesError)
              }
            />
          </div>
        ) : null}

        {!accountsLoading && (accountsList?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 px-4 py-12 text-center shadow-sm backdrop-blur-sm sm:rounded-[2.5rem] sm:px-6 sm:py-16 md:px-8 lg:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 hover:rotate-12 sm:h-20 sm:w-20 sm:rounded-3xl">
              <Plus className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground sm:mt-6 sm:text-2xl">
              No accounts found
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
              You need to create at least one account before you can start
              recording transactions. It only takes a minute!
            </p>
            <div className="mt-8 w-full sm:mt-10 sm:w-auto">
              <Link
                to="/accounts"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] sm:w-auto sm:px-8 sm:text-base"
              >
                <Plus className="h-5 w-5" />
                Create First Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <TransactionsToolbar
              filters={filters}
              onFiltersChange={(patch) => {
                setFilters((prev) => ({ ...prev, ...patch }));
                setCurrentPage(1); // Reset to first page on filter change
              }}
              accounts={accountsList}
              categories={categoriesList}
            />

            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm sm:rounded-3xl">
              <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Transaction Feed
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Showing your most recent transactions first.
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 text-sm text-muted-foreground sm:w-auto sm:justify-start">
                    <span>Page size</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger
                        aria-label="Page size"
                        className="h-10 w-20 min-w-20 rounded-xl border border-input bg-background! px-3 text-sm text-foreground"
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent
                        position="popper"
                        align="end"
                        sideOffset={6}
                      >
                        {[10, 25, 50].map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3 px-4 py-5 sm:px-6 sm:py-6 md:px-8">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : transactions.length === 0 ? (
                <div className="px-4 py-12 text-center sm:px-6 sm:py-16 md:px-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground sm:text-xl">
                    No transactions found
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-muted-foreground">
                    Try adjusting your search/filter, or load more results to
                    continue browsing.
                  </p>
                </div>
              ) : (
                <div className="min-w-0 px-3 py-3 sm:px-6 sm:py-4 md:px-8">
                  <div className="-mx-3 overflow-x-auto overscroll-x-contain sm:mx-0">
                    <TransactionsTable
                      transactions={paginatedTransactions}
                      accountsById={accountsById}
                      categoriesById={categoriesById}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </div>

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
            </div>
          </>
        )}

        <TransactionDetailModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          transaction={selectedTransaction}
          orgId={orgId}
          accounts={accountsList}
          categories={categoriesList}
          currencyCode={
            accountsList?.find(
              (a) => a.id === selectedTransaction?.from_account_id,
            )?.currency_code
          }
          onEdit={(tx) => {
            setSelectedTransaction(tx);
            setEditOpen(true);
          }}
          onDelete={(tx) => {
            setSelectedTransaction(tx);
            setDeleteOpen(true);
          }}
        />

        <TransactionEditModal
          key={editOpen ? "edit-open" : "edit-closed"}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          transaction={selectedTransaction}
          accounts={accountsList as Account[]}
          categories={categoriesList as Category[]}
          existingBills={existingBills}
          loading={updateMutation.isPending}
          deleting={isDeleting}
          errorMessage={editError ?? updateMutation.error?.message ?? null}
          onSubmit={async ({
            tranId,
            fromAccountId,
            data,
            filesToAdd,
            billIdsToDelete,
          }) => {
            try {
              setEditError(null);
              // 1. update transactions details
              await updateMutation.mutateAsync({
                tranId,
                fromAccountId,
                data,
              });

              // 2. only run if user added more bills
              if (filesToAdd.length > 0) {
                // Convert files to PresignFileInput array for bill uploads
                const bills = filesToAdd.map((f) => ({
                  file_name: f.name,
                  mime_type: f.type,
                  file_size_bytes: f.size,
                })) as PresignFileInput[];

                const presignURL = await presignMutation.mutateAsync({
                  txId: tranId,
                  bills,
                });

                // 3. PUT each file directly to MinIO using the presigned URL
                await Promise.all(
                  presignURL.map(({ upload_url, file_name }) => {
                    const bill = filesToAdd.find((b) => b.name === file_name)!;
                    return fetch(upload_url, {
                      method: "PUT",
                      body: bill,
                      headers: { "Content-Type": bill.type },
                    });
                  }),
                );

                // 4. Confirm that files are uploaded to bucket from go server
                const toBeConfirmBills = presignURL.map(
                  ({ object_key, file_name }) => {
                    const bill = filesToAdd.find((b) => b.name === file_name)!;
                    return {
                      object_key,
                      file_name,
                      mime_type: bill.type,
                      file_size_bytes: bill.size,
                    };
                  },
                ) as ConfirmBillInput[];

                await confirmMutation.mutateAsync({
                  txId: tranId,
                  bills: toBeConfirmBills,
                });
              }

              // 3. delete bills
              if (billIdsToDelete.length > 0) {
                for (const billId of billIdsToDelete) {
                  await deleteBillMutation(billId);
                }
              }

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
          onClose={() => {
            setPendingTxId("");
            setCreateOpen(false);
          }}
          accounts={accountsList as Account[]}
          categories={categoriesList as Category[]}
          loading={createMutation.isPending}
          errorMessage={createError ?? createMutation.error?.message ?? null}
          onSubmit={async ({ fromAccountId, data, files }) => {
            try {
              setCreateError(null);
              // 1. create transaction and get the id
              let txId = pendingTxId;
              if (!txId) {
                const res = await createMutation.mutateAsync({
                  fromAccountId,
                  data,
                });
                txId = res.id;
                setPendingTxId(txId);
              }

              // 2. only run if user attached bills
              if (files.length > 0) {
                // Convert files to PresignFileInput array for bill uploads
                const bills = files.map((f) => ({
                  file_name: f.name,
                  mime_type: f.type,
                  file_size_bytes: f.size,
                })) as PresignFileInput[];

                const presignURL = await presignMutation.mutateAsync({
                  txId,
                  bills,
                });

                // 3. PUT each file directly to MinIO using the presigned URL
                await Promise.all(
                  presignURL.map(({ upload_url, file_name }) => {
                    const bill = files.find((b) => b.name === file_name)!;
                    return fetch(upload_url, {
                      method: "PUT",
                      body: bill,
                      headers: { "Content-Type": bill.type },
                    });
                  }),
                );

                // 4. Confirm that files are uploaded to bucket from go server
                const toBeConfirmBills = presignURL.map(
                  ({ object_key, file_name }) => {
                    const bill = files.find((b) => b.name === file_name)!;
                    return {
                      object_key,
                      file_name,
                      mime_type: bill.type,
                      file_size_bytes: bill.size,
                    };
                  },
                ) as ConfirmBillInput[];

                await confirmMutation.mutateAsync({
                  txId,
                  bills: toBeConfirmBills,
                });
              }

              setPendingTxId("");

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
              // 1. Delete linked bills
              if (existingBills.length > 0) {
                for (const bill of existingBills) {
                  await deleteBillMutation(bill.id);
                }
              }

              // 2. Delete transaction
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
  );
}
