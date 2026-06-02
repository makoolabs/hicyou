"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createBacklinkResource,
  updateBacklinkResource,
  deleteBacklinkResource,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { BacklinkResource } from "@/lib/data";

export function BacklinkResourceManager({ resources }: { resources: BacklinkResource[] }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [editing, setEditing] = useState<BacklinkResource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      url: fd.get("url") as string,
      drScore: fd.get("drScore") as string,
      linkType: fd.get("linkType") as string,
      category: fd.get("category") as string,
      cost: fd.get("cost") as string,
      description: fd.get("description") as string,
      sortOrder: fd.get("sortOrder") as string,
    };

    try {
      let result;
      if (editing) {
        result = await updateBacklinkResource(null, { id: editing.id.toString(), ...data });
      } else {
        result = await createBacklinkResource(null, data);
      }
      if (result.success) {
        toast.success(editing ? (t("backlinkUpdated") || "Updated!") : (t("backlinkCreated") || "Created!"));
        setDialogOpen(false);
        setEditing(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed");
      }
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      const result = await deleteBacklinkResource(null, { id: deleteId.toString() });
      if (result.success) toast.success(t("backlinkDeleted") || "Deleted!");
      else toast.error(result.error || "Failed");
      setDeleteId(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("backlinkResourcesDesc") || "Manage SEO backlink resources"}</p>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />{t("addBacklinkResource") || "Add Resource"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">DR</TableHead>
            <TableHead>{t("name") || "Name"}</TableHead>
            <TableHead>{t("type") || "Type"}</TableHead>
            <TableHead>{t("category") || "Category"}</TableHead>
            <TableHead>{t("cost") || "Cost"}</TableHead>
            <TableHead className="w-[100px]">{t("actions") || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono font-bold">{r.drScore}</TableCell>
              <TableCell>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-1">
                  {r.name}<ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell>
                <span className={r.linkType === "dofollow" ? "text-green-600 font-medium" : "text-orange-500"}>{r.linkType}</span>
              </TableCell>
              <TableCell>{r.category}</TableCell>
              <TableCell>{r.cost}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? (t("editBacklinkResource") || "Edit") : (t("addBacklinkResource") || "Add")}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="bl-name">{t("name") || "Name"}</Label><Input id="bl-name" name="name" required defaultValue={editing?.name || ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bl-url">URL</Label><Input id="bl-url" name="url" type="url" required defaultValue={editing?.url || ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bl-dr">DR Score</Label><Input id="bl-dr" name="drScore" type="number" defaultValue={editing?.drScore?.toString() || "50"} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bl-sort">{t("sortOrder") || "Order"}</Label><Input id="bl-sort" name="sortOrder" type="number" defaultValue={editing?.sortOrder?.toString() || "0"} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bl-type">{t("linkType") || "Link Type"}</Label>
                <Select name="linkType" defaultValue={editing?.linkType || "dofollow"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dofollow">Dofollow</SelectItem>
                    <SelectItem value="nofollow">Nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bl-cost">{t("cost") || "Cost"}</Label>
                <Select name="cost" defaultValue={editing?.cost || "Free"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="bl-cat">{t("category") || "Category"}</Label>
                <Input id="bl-cat" name="category" defaultValue={editing?.category || "General"} placeholder="GameDev, General, AI, Directory..." />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="bl-desc">{t("description") || "Description"}</Label>
                <Input id="bl-desc" name="description" defaultValue={editing?.description || ""} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel") || "Cancel"}</Button>
              <Button type="submit" disabled={saving}>{saving ? (t("saving") || "Saving...") : editing ? (t("save") || "Save") : (t("create") || "Create")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("confirmDelete") || "Confirm Delete"}</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">{t("confirmDeleteBacklink") || "Delete this backlink resource?"}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t("cancel") || "Cancel"}</Button>
            <Button variant="destructive" onClick={confirmDelete}>{t("delete") || "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
