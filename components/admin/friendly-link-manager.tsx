"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createFriendlyLink,
  updateFriendlyLink,
  deleteFriendlyLink,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { FriendlyLink } from "@/lib/data";

export function FriendlyLinkManager({ links: initialLinks }: { links: FriendlyLink[] }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [editingLink, setEditingLink] = useState<FriendlyLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingLink(null);
  };

  const handleEdit = (link: FriendlyLink) => {
    setEditingLink(link);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingLink(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      url: formData.get("url") as string,
      description: formData.get("description") as string,
      sortOrder: formData.get("sortOrder") as string,
    };

    try {
      let result;
      if (editingLink) {
        result = await updateFriendlyLink(null, {
          id: editingLink.id.toString(),
          ...data,
        });
      } else {
        result = await createFriendlyLink(null, data);
      }

      if (result.success) {
        toast.success(
          editingLink
            ? (t("friendlyLinkUpdated") || "Link updated!")
            : (t("friendlyLinkCreated") || "Link created!")
        );
        setDialogOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error || t("error") || "Failed to save");
      }
    } catch (err) {
      toast.error(t("error") || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      const result = await deleteFriendlyLink(null, { id: deleteId.toString() });
      if (result.success) {
        toast.success(t("friendlyLinkDeleted") || "Link deleted!");
      } else {
        toast.error(result.error || "Failed to delete");
      }
      setDeleteId(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("friendlyLinksDesc") || "Manage friendly links displayed on the Friends page"}
        </p>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addFriendlyLink") || "Add Link"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>{t("title") || "Title"}</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>{t("description") || "Description"}</TableHead>
            <TableHead className="w-[80px]">{t("sortOrder") || "Order"}</TableHead>
            <TableHead className="w-[100px]">{t("actions") || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialLinks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {t("noFriendlyLinks") || "No friendly links yet"}
              </TableCell>
            </TableRow>
          ) : (
            initialLinks.map((link, idx) => (
              <TableRow key={link.id}>
                <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="font-medium">{link.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-flex items-center gap-1">
                    {link.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {link.description || "—"}
                </TableCell>
                <TableCell>{link.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(link)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(link.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink
                ? (t("editFriendlyLink") || "Edit Friendly Link")
                : (t("addFriendlyLink") || "Add Friendly Link")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fl-title">{t("title") || "Title"}</Label>
              <Input
                id="fl-title"
                name="title"
                required
                defaultValue={editingLink?.title || ""}
                placeholder="Debian.Club"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fl-url">URL</Label>
              <Input
                id="fl-url"
                name="url"
                type="url"
                required
                defaultValue={editingLink?.url || ""}
                placeholder="https://debian.club/"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fl-desc">{t("description") || "Description"}</Label>
              <Textarea
                id="fl-desc"
                name="description"
                rows={2}
                defaultValue={editingLink?.description || ""}
                placeholder="Debian 中文社区"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fl-sort">{t("sortOrder") || "Sort Order"}</Label>
              <Input
                id="fl-sort"
                name="sortOrder"
                type="number"
                defaultValue={editingLink?.sortOrder?.toString() || "0"}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel") || "Cancel"}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? (t("saving") || "Saving...")
                  : editingLink
                    ? (t("save") || "Save")
                    : (t("create") || "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete") || "Confirm Delete"}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {t("confirmDeleteFriendlyLink") || "Are you sure you want to delete this friendly link?"}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("delete") || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
