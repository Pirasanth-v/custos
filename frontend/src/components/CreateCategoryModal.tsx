import { useState, type FormEvent } from "react";
import Modal from "./ui/modal";
import { X, Tags, Loader2 } from "lucide-react";
import { useCreateCategory } from "@/features/category/hooks/useCreateCategory";
import useOrgStore from "@/store/orgStore";
import axios from "axios";
import StatusMessage from "./StatusMessage";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateCategoryModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id || "";

  const { mutateAsync: createCategory, isPending } = useCreateCategory(orgId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);

    try {
      await createCategory(name.trim());
      setName("");
      onClose();
    } catch (err) {
      let message = "Something went wrong. Try again later.";
      if (axios.isAxiosError(err)) {
        message = err?.response?.data?.error || message;
      }
      setError(message);
    }
  };

  const handleClose = () => {
    setName("");
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-4 text-foreground sm:space-y-6 sm:p-6"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
              <Tags size={20} className="shrink-0 text-primary" /> Create
              Category
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Add a new category to organize your transactions.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close create category modal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <StatusMessage
          type="error"
          message={error || undefined}
          compact
          onClose={() => setError(null)}
        />

        <div>
          <label className="text-sm font-medium text-foreground">
            Category Name
          </label>
          <div className="mt-1.5 flex h-11 min-w-0 items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Software Subscriptions"
              className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 w-full rounded-xl border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-accent sm:w-auto"
            disabled={isPending}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={isPending || !name.trim()}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Category
          </button>
        </div>
      </form>
    </Modal>
  );
}
