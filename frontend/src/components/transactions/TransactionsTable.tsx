import type { Account } from "@/features/account/types";
import type { Transaction } from "@/features/transaction/types";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import TransactionActionsMenu from "./TransactionActionsMenu";
import TransactionStatusBadge from "./TransactionStatusBadge";
import TransactionTypeBadge from "./TransactionTypeBadge";

type TransactionsTableProps = {
  transactions: Transaction[];
  accountsById?: Record<string, Account>;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
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

export default function TransactionsTable({
  transactions,
  accountsById,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleMenuClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    transactionId: string,
  ) => {
    e.stopPropagation();
    setMenuOpenId(transactionId);
    setAnchorEl(e.currentTarget);
  };

  const closeMenu = () => setMenuOpenId(null);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-border">
          <tr className="text-sm text-muted-foreground">
            <th className="px-6 py-4 font-medium md:px-8">Date</th>
            <th className="px-6 py-4 font-medium">Type</th>
            <th className="px-6 py-4 font-medium">Amount</th>
            <th className="hidden px-6 py-4 font-medium lg:table-cell">
              Description
            </th>
            <th className="px-6 py-4 font-medium">Accounts</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right md:px-8">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => {
            const fromAcc = accountsById?.[t.from_account_id];
            const toAcc = t.to_account_id ? accountsById?.[t.to_account_id] : undefined;

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
                className="cursor-default border-b border-border/60 transition hover:bg-muted/40"
              >
                <td className="px-6 py-4 md:px-8">
                  <div className="text-sm font-medium text-foreground">
                    {formatDate(t.created_at)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t.id.slice(0, 8)}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <TransactionTypeBadge type={t.type} />
                </td>

                <td className="px-6 py-4">
                  <span
                    className={[
                      "text-sm font-semibold",
                      signed >= 0 ? "text-emerald-400" : "text-destructive",
                    ].join(" ")}
                  >
                    {amountLabel}
                  </span>
                </td>

                <td className="hidden px-6 py-4 text-sm text-muted-foreground lg:table-cell">
                  <div className="max-w-[520px] truncate">
                    {t.description && t.description.trim()
                      ? t.description.trim().length > 60
                        ? t.description.trim().slice(0, 30) + "..."
                        : t.description.trim()
                      : <span className="italic text-muted-foreground">—</span>}
               
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">
                    {fromAcc?.name ?? t.from_account_id}
                  </div>
                  {t.type === "transfer" ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      → {toAcc?.name ?? t.to_account_id ?? "—"}
                    </div>
                  ) : null}
                </td>

                <td className="px-6 py-4">
                  <TransactionStatusBadge status={t.status} />
                </td>

                <td className="px-6 py-4 text-right md:px-8">
                  <button
                    type="button"
                    onClick={(e) => handleMenuClick(e, t.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={`Open actions for transaction ${t.id}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  <TransactionActionsMenu
                    open={menuOpenId === t.id}
                    anchorRef={
                      anchorEl ? ({ current: anchorEl } as React.RefObject<HTMLButtonElement>) : undefined
                    }
                    onClose={closeMenu}
                    onEdit={() => {
                      closeMenu();
                      onEdit(t);
                    }}
                    onDelete={() => {
                      closeMenu();
                      onDelete(t);
                    }}
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

