import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";
import type { Transaction } from "@/features/transaction/types";
import TransactionActionsMenu from "./TransactionActionsMenu";
import TransactionStatusBadge from "./TransactionStatusBadge";
import TransactionTypeBadge from "./TransactionTypeBadge";

type TransactionsTableProps = {
  transactions: Transaction[];
  accountsById?: Record<string, Account>;
  categoriesById?: Record<string, Category>;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onView: (transaction: Transaction) => void;
};

function formatMoney(amount: number, currencyCode: string) {
  if (!Number.isFinite(amount)) return String(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
  if (diff < 31104000) {
    const months = Math.floor(diff / 2592000);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString();
}

export default function TransactionsTable({
  transactions,
  accountsById,
  categoriesById,
  onEdit,
  onDelete,
  onView,
}: TransactionsTableProps) {


  return (
    <div className="w-full overflow-hidden">
      <table className="w-full table-auto text-left">
        <thead className="border-b border-border">
          <tr className="text-sm text-muted-foreground">
            <th className="px-4 py-3.5 font-medium sm:px-6 md:px-8">Date</th>
            <th className="hidden px-4 py-3.5 font-medium sm:table-cell sm:px-6">Type</th>
            <th className="px-4 py-3.5 font-medium sm:px-6">Amount</th>
            <th className="hidden px-6 py-3.5 font-medium xl:table-cell">
              Description
            </th>
            <th className="hidden px-6 py-3.5 font-medium lg:table-cell">Accounts</th>
            <th className="hidden px-6 py-3.5 font-medium md:table-cell">Status</th>
            <th className="px-4 py-3.5 font-medium text-center sm:px-6 md:px-8">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => {
            const fromAcc = accountsById?.[t.from_account_id];
            const toAcc = t.to_account_id ? accountsById?.[t.to_account_id] : undefined;
            const category = t.category_id ? categoriesById?.[t.category_id] : undefined;

            const amountNum = Number(t.amount);
            const signed =
              t.type === "income" ? amountNum : t.type === "expense" ? -amountNum : -amountNum;

            const currencyCode = fromAcc?.currency_code;
            const amountLabel =
              currencyCode && Number.isFinite(signed)
                ? formatMoney(signed, currencyCode)
                : `${signed >= 0 ? "+" : ""}${t.amount}`;

            return (
              <tr
                key={t.id}
                className="group cursor-default border-b border-border/60 transition hover:bg-muted/40"
              >
                <td className="px-4 py-3.5 sm:px-4 md:px-6">
                  <div className="text-sm font-medium text-foreground">
                    {formatDate(t.created_at)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatTime(t.created_at)}
                  </div>
                </td>

                <td className="hidden px-4 py-3.5 sm:table-cell sm:px-6">
                  <TransactionTypeBadge type={t.type} />
                </td>

                <td className="whitespace-nowrap px-2 py-3.5 sm:px-4 md:px-6">
                  <span
                    className={[
                      "text-sm font-semibold",
                      signed >= 0 ? "text-emerald-400" : "text-destructive",
                    ].join(" ")}
                  >
                    {amountLabel}
                  </span>
                </td>

                <td className="hidden px-6 py-3.5 text-sm text-muted-foreground xl:table-cell">
                  <div className="max-w-[520px] truncate">
                    {t.description && t.description.trim()
                      ? t.description.trim().length > 60
                        ? t.description.trim().slice(0, 30) + "..."
                        : t.description.trim()
                      : <span className="italic text-muted-foreground">—</span>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Category: {category?.name ?? t.category_id ?? "—"}
                  </div>
                </td>

                <td className="hidden px-6 py-3.5 lg:table-cell">
                  <div className="text-sm font-medium text-foreground">
                    {fromAcc?.name ?? t.from_account_id}
                  </div>
                  {t.type === "transfer" ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      → {toAcc?.name ?? t.to_account_id ?? "—"}
                    </div>
                  ) : null}
                </td>

                <td className="hidden px-6 py-3.5 md:table-cell">
                  <TransactionStatusBadge status={t.status} />
                </td>

                <td className="whitespace-nowrap px-2 py-3.5 text-right sm:px-4 md:px-6">
                  <TransactionActionsMenu
                    onView={() => onView(t)}
                    onEdit={() => onEdit(t)}
                    onDelete={() => onDelete(t)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

