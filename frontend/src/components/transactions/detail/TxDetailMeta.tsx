import { format, parseISO } from "date-fns";
import { TxDetailField } from "./TxDetailField";
import type { Transaction } from "@/features/transaction/types";
import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";
import { TxAuditRow } from "./TxAuditRow";
import useAuthStore from "@/store/authStore";

type TxDetailMetaProps = {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
};

function safeFormat(iso: string | null | undefined, fmt: string): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), fmt);
  } catch {
    return "—";
  }
}

function accountLabel(accounts: Account[], id: string | null | undefined) {
  if (!id) return null;
  const a = accounts.find((x) => x.id === id);
  return a ? `${a.name} · ${a.currency_code}` : id.slice(0, 8) + "…";
}

function categoryLabel(categories: Category[], id: string | null | undefined) {
  if (!id) return null;
  return categories.find((c) => c.id === id)?.name ?? null;
}

export function TxDetailMeta({
  transaction,
  accounts,
  categories,
}: TxDetailMetaProps) {
  const isTransfer = transaction.type === "transfer";
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  return (
    <div className="px-6 pb-5">
      {/* Divider */}
      <div className="mb-5 h-px w-full bg-border/60" />

      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* From account */}
        <TxDetailField
          label="From account"
          value={accountLabel(accounts, transaction.from_account_id)}
        />

        {/* To account — only for transfers */}
        {isTransfer ? (
          <TxDetailField
            label="To account"
            value={accountLabel(accounts, transaction.to_account_id)}
          />
        ) : (
          <TxDetailField
            label="Category"
            value={categoryLabel(categories, transaction.category_id)}
          />
        )}

        {/* For transfer, show category below */}
        {isTransfer && (
          <TxDetailField
            label="Category"
            value={categoryLabel(categories, transaction.category_id)}
          />
        )}

        {/* Transaction date */}
        <TxDetailField
          label="Transaction date"
          value={
            transaction.created_at
              ? safeFormat(transaction.created_at, "d MMM yyyy")
              : safeFormat(transaction.created_at, "d MMM yyyy")
          }
        />
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-border/40 pt-4">
        <TxAuditRow
          action="Created"
          name={transaction.created_by_name}
          iso={transaction.created_at}
          isMe={currentUserId == transaction.created_by}
        />
        {transaction.updated_by_name &&
          transaction.updated_at !== transaction.created_at && (
            <TxAuditRow
              action="Last edited"
              name={transaction.updated_by_name}
              iso={transaction.updated_at}
              isMe={currentUserId == transaction.updated_by}
            />
          )}
      </div>

    </div>
  );
}