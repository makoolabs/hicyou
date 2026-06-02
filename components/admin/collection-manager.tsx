"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  addCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
  ActionState,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Collection, CollectionItem } from "@/lib/data";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface CollectionWithItems extends Collection {
  items?: CollectionItem[];
}

interface CollectionManagerProps {
  collections: CollectionWithItems[];
}

export function CollectionManager({ collections: initialCollections }: CollectionManagerProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [collections, setCollections] = useState(initialCollections);
  const [editingCollection, setEditingCollection] = useState<CollectionWithItems | null>(null);
  const [collectionForm, setCollectionForm] = useState({ title: "", description: "", slug: "", coverImage: "" });
  const [itemForm, setItemForm] = useState({ title: "", url: "", description: "" });
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const resetCollectionForm = () => setCollectionForm({ title: "", description: "", slug: "", coverImage: "" });
  const resetItemForm = () => setItemForm({ title: "", url: "", description: "" });

  const handleCreate = async () => {
    const result = await createCollection(null, collectionForm);
    if (result.success) {
      toast.success("Collection created!");
      setIsCreateOpen(false);
      resetCollectionForm();
      router.refresh();
    } else {
      toast.error(result.error || "Failed");
    }
  };

  const handleUpdate = async () => {
    if (!editingCollection) return;
    const result = await updateCollection(null, {
      id: editingCollection.id.toString(),
      ...collectionForm,
    });
    if (result.success) {
      toast.success("Collection updated!");
      setIsEditOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed");
    }
  };

  const handleDelete = async () => {
    if (!editingCollection) return;
    const result = await deleteCollection(null, { id: editingCollection.id.toString() });
    if (result.success) {
      toast.success("Collection deleted!");
      setIsDeleteOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed");
    }
  };

  const handleAddItem = async () => {
    if (!editingCollection) return;
    const result = await addCollectionItem(null, {
      collectionId: editingCollection.id.toString(),
      ...itemForm,
    });
    if (result.success) {
      toast.success("Item added!");
      setIsItemOpen(false);
      resetItemForm();
      router.refresh();
    } else {
      toast.error(result.error || "Failed");
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    const result = await updateCollectionItem(null, {
      id: editingItem.id.toString(),
      ...itemForm,
    });
    if (result.success) {
      toast.success("Item updated!");
      setEditingItem(null);
      resetItemForm();
      router.refresh();
    } else {
      toast.error(result.error || "Failed");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const result = await deleteCollectionItem(null, { id: itemId.toString() });
    if (result.success) {
      toast.success("Item deleted!");
      router.refresh();
    } else {
      toast.error(result.error || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("collectionManagement") || "Collection Management"}</h2>
        <Button
          onClick={() => {
            resetCollectionForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addCollection") || "Add Collection"}
        </Button>
      </div>

      {/* Collections List */}
      <div className="space-y-4">
        {collections.map((col) => (
          <Card key={col.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{col.title}</h3>
                {col.description && (
                  <p className="text-sm text-muted-foreground mt-1">{col.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">/{col.slug}</p>
                {/* Items list */}
                {col.items && col.items.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {col.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span className="font-medium">{item.title}</span>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setEditingItem(item);
                            setItemForm({ title: item.title, url: item.url, description: item.description || "" });
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCollection(col);
                    setIsItemOpen(true);
                    resetItemForm();
                  }}
                >
                  + {t("addItem") || "Add Item"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingCollection(col);
                    setCollectionForm({
                      title: col.title,
                      description: col.description || "",
                      slug: col.slug,
                      coverImage: col.coverImage || "",
                    });
                    setIsEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => {
                    setEditingCollection(col);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addCollection") || "Add Collection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("title")}</Label><Input value={collectionForm.title} onChange={e => setCollectionForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>{t("slug")}</Label><Input value={collectionForm.slug} onChange={e => setCollectionForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated-if-empty" /></div>
            <div><Label>{t("description")}</Label><Textarea value={collectionForm.description} onChange={e => setCollectionForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>{t("coverImage") || "Cover Image URL"}</Label><Input value={collectionForm.coverImage} onChange={e => setCollectionForm(p => ({ ...p, coverImage: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>{t("create") || "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCollection") || "Edit Collection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("title")}</Label><Input value={collectionForm.title} onChange={e => setCollectionForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>{t("slug")}</Label><Input value={collectionForm.slug} onChange={e => setCollectionForm(p => ({ ...p, slug: e.target.value }))} /></div>
            <div><Label>{t("description")}</Label><Textarea value={collectionForm.description} onChange={e => setCollectionForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>{t("coverImage") || "Cover Image URL"}</Label><Input value={collectionForm.coverImage} onChange={e => setCollectionForm(p => ({ ...p, coverImage: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteCollection") || "Delete Collection"}</DialogTitle>
            <DialogDescription>{t("deleteCollectionConfirm") || "Are you sure? This will also delete all items."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isItemOpen} onOpenChange={setIsItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addItem") || "Add Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("title")}</Label><Input value={itemForm.title} onChange={e => setItemForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>URL</Label><Input value={itemForm.url} onChange={e => setItemForm(p => ({ ...p, url: e.target.value }))} /></div>
            <div><Label>{t("description")}</Label><Textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddItem}>{t("add") || "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog (inline) */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editItem") || "Edit Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>{t("title")}</Label><Input value={itemForm.title} onChange={e => setItemForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>URL</Label><Input value={itemForm.url} onChange={e => setItemForm(p => ({ ...p, url: e.target.value }))} /></div>
              <div><Label>{t("description")}</Label><Textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateItem}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
