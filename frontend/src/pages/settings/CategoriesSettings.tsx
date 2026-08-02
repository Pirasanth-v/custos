import { useState, useMemo, useCallback } from "react";
import { useGetCategoriesByOrgId } from "@/features/category/hooks/useGetCategoriesByOrgId";
import Table from "@/components/Table";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import EditCategoryModal from "@/components/EditCategoryModal";
import DeleteCategoryModal from "@/components/DeleteCategoryModal";
import CategoryActionMenu from "@/components/CategoryActionMenu";
import { Ellipsis, Plus } from "lucide-react";
import useOrgStore from "@/store/orgStore";
import type { Category } from "@/features/category/types";
import { format } from "date-fns";

const CategoriesSettings = () => {
  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id ?? "";
  const { data: categories = [], loading: isLoading, error } = useGetCategoriesByOrgId(orgId);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [ellipsisMenuOpen, setEllipsisMenuOpen] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const headers = useMemo(() => ["Name", "Created At", ""], []);

  const handleEllipsisClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, categoryId: string) => {
      e.stopPropagation();
      setEllipsisMenuOpen(categoryId);
      setAnchorEl(e.currentTarget);
    },
    []
  );

  const handleEdit = useCallback((category: Category) => {
    setEllipsisMenuOpen(null);
    setSelectedCategory(category);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((category: Category) => {
    setEllipsisMenuOpen(null);
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  }, []);

  const renderRow = useCallback(
    (category: Category) => (
      <>
        <td className="px-4 py-3 font-medium text-foreground">{category.name}</td>
        <td className="px-4 py-3 text-muted-foreground text-sm">
          {category.created_at ? format(new Date(category.created_at), "MMM d, yyyy") : "N/A"}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="relative inline-block text-left">
            <button
              onClick={(e) => handleEllipsisClick(e, category.id)}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Open actions menu"
            >
              <Ellipsis size={18} />
            </button>
            <CategoryActionMenu
              open={ellipsisMenuOpen === category.id}
              anchorRef={anchorEl ? { current: anchorEl } : undefined}
              onClose={() => setEllipsisMenuOpen(null)}
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDelete(category)}
            />
          </div>
        </td>
      </>
    ),
    [ellipsisMenuOpen, anchorEl, handleEllipsisClick, handleEdit, handleDelete]
  );

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading categories...</p>;
  if (error) return <p className="p-6 text-destructive">Error loading categories</p>;

  // Filter out soft-deleted categories if the backend occasionally returns them, 
  // although usually GET /categories should only return active ones.
  const activeCategories = categories.filter((c) => !c.deleted_at);

  return (
    <div className="min-w-0 py-2">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Categories</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Manage categories for your organization's transactions.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 sm:w-auto"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>
      <div className="min-w-0 overflow-hidden">
        <Table
          headers={headers}
          data={activeCategories}
          renderRow={(row) => renderRow(row as Category)}
          onRowClick={() => { }}
        />
      </div>
      {activeCategories.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-8 text-center sm:py-10">
          <p className="text-sm leading-6 text-muted-foreground">No categories found. Create one to get started.</p>
        </div>
      )}

      <CreateCategoryModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditCategoryModal
        key={`${editModalOpen}-${categories.length}`}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        category={selectedCategory}
      />

      <DeleteCategoryModal
        key={deleteModalOpen ? "open" : "closed"}
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoriesSettings;
