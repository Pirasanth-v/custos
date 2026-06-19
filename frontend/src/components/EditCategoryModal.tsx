import { useState, type FormEvent } from "react";
import Modal from "./ui/modal";
import { X, Loader2 } from "lucide-react";
import { useUpdateCategory } from "@/features/category/hooks/useUpdateCategory";
import type { Category } from "@/features/category/types";
import useOrgStore from "@/store/orgStore";
import axios from "axios";
import StatusMessage from "./StatusMessage";
import { toast } from "@/lib/toast";

type Props = {
  open: boolean;
  onClose: () => void;
  category: Category | null;
};

export default function EditCategoryModal({ open, onClose, category }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id || "";

  const { mutateAsync: updateCategory, isPending } = useUpdateCategory(orgId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    setError(null);

    try {
      await updateCategory({ categoryId: category.id, name: name.trim() });
      toast.success("Category updated");
      onClose();
    } catch (err) {
      let message = "Something went wrong. Try again later.";
      if (axios.isAxiosError(err)) {
        message = err?.response?.data?.error || message;
      }
      setError(message);
    }
  };

  if (!category) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-foreground">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Edit Category</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update the name of this category.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
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
          <div className="mt-1.5 flex items-center gap-2 border border-border rounded-xl px-3 h-11 bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Software Subscriptions"
              className="bg-transparent outline-none w-full text-sm"
              autoComplete="off"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-xl border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
            disabled={isPending}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isPending || !name.trim() || name.trim() === category.name
            }
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
