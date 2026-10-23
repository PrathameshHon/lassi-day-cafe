"use client";

import { useState } from "react";
import { Check, Plus, RotateCcw, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/charge";
import { menuCategories, type UseMenuReturn } from "@/lib/staff-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const INPUT_CLS =
  "[color-scheme:dark] border-white/15 bg-plum-950/60 text-cream-100 placeholder:text-cream-100/30 focus-visible:ring-brand-500/40";

/** One editable menu row: commit name/category/price on blur or Enter. */
function MenuRow({
  item,
  categories,
  onUpdate,
  onRemove,
}: {
  item: StaffMenuItem;
  categories: string[];
  onUpdate: (id: string, patch: Partial<Pick<StaffMenuItem, "name" | "category" | "price">>) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(String(item.price));

  const commit = () => {
    const parsedPrice = Number(price);
    if (name.trim() === "") {
      toast.error("Item name cannot be empty");
      setName(item.name);
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error(`Price for “${name.trim()}” must be ₹0 or more`);
      setPrice(String(item.price));
      return;
    }
    onUpdate(item.id, {
      name: name.trim(),
      category: category.trim() || "Other",
      price: parsedPrice,
    });
  };

  const dirty = name !== item.name || category !== item.category || price !== String(item.price);

  return (
    <li className="rounded-xl bg-plum-950/50 px-3 py-2.5">
      <div className="grid grid-cols-[1fr_88px_auto] items-end gap-2 sm:grid-cols-[1fr_150px_110px_auto]">
        <div className="grid gap-1">
          <Label htmlFor={`mi-name-${item.id}`} className="sr-only">
            Item name
          </Label>
          <Input
            id={`mi-name-${item.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            placeholder="Item name"
            className={cn(INPUT_CLS, "h-9 text-sm")}
            aria-label="Item name"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`mi-cat-${item.id}`} className="sr-only">
            Category
          </Label>
          <Input
            id={`mi-cat-${item.id}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            placeholder="Category"
            list="menu-category-list"
            className={cn(INPUT_CLS, "h-9 text-sm")}
            aria-label="Category"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`mi-price-${item.id}`} className="sr-only">
            Price in rupees
          </Label>
          <Input
            id={`mi-price-${item.id}`}
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className={cn(INPUT_CLS, "h-9 text-sm")}
            aria-label="Price in rupees"
          />
        </div>
        <div className="flex items-center gap-1 pb-0.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={!dirty}
            onClick={() => {
              commit();
              toast.success(`“${name.trim()}” updated`);
            }}
            aria-label={`Save changes to ${item.name}`}
            className={cn(
              "size-8 text-cream-100/60 hover:bg-brand-500/15 hover:text-brand-400",
              dirty && "text-gold-400",
            )}
          >
            <Check className="size-4" aria-hidden />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Delete ${item.name}`}
                className="size-8 text-cream-100/40 hover:bg-coral-500/10 hover:text-coral-500"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Delete “{item.name}”?</AlertDialogTitle>
                <AlertDialogDescription className="text-cream-100/60">
                  It disappears from the order popup immediately. Old bills keep their original items and prices.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/15 bg-transparent text-cream-100 hover:bg-white/10 hover:text-cream-100">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onRemove(item.id);
                    toast.success(`“${item.name}” removed from the menu`);
                  }}
                  className="bg-coral-500 text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
                >
                  Delete item
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </li>
  );
}

/** Staff → Menu Management: add, edit, delete the items staff can order for tables. */
export default function MenuManageView({ menuApi }: { menuApi: UseMenuReturn }) {
  const { menu, ready, addItem, updateItem, removeItem, resetToDefault } = menuApi;
  const categories = menuCategories(menu);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const submitAdd = () => {
    const price = Number(newPrice);
    if (newName.trim() === "") {
      toast.error("Give the item a name first");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Price must be ₹0 or more");
      return;
    }
    if (addItem(newName, newCategory, price)) {
      toast.success(`“${newName.trim()}” added — available on every table popup now`);
      setNewName("");
      setNewPrice("");
    } else {
      toast.error("Could not add the item");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Add item */}
      <section aria-label="Add a menu item" className="rounded-2xl border border-white/10 bg-plum-900/80 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10">
            <UtensilsCrossed className="size-5 text-brand-400" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-cream-100">Menu Management</h2>
            <p className="mt-0.5 text-xs text-cream-100/50">
              The live list staff can order from on any table. Changes apply instantly — old bills keep their original
              items &amp; prices.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_170px_130px_auto] sm:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="new-item-name" className="text-cream-100/80">
              Item name
            </Label>
            <Input
              id="new-item-name"
              placeholder="e.g. Kesar Lassi"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAdd()}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-item-category" className="text-cream-100/80">
              Category
            </Label>
            <Input
              id="new-item-category"
              placeholder="e.g. Lassi"
              list="menu-category-list"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAdd()}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-item-price" className="text-cream-100/80">
              Price (₹)
            </Label>
            <Input
              id="new-item-price"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="e.g. 120"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAdd()}
              className={INPUT_CLS}
            />
          </div>
          <Button
            type="button"
            onClick={submitAdd}
            className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
          >
            <Plus className="size-4" aria-hidden /> Add item
          </Button>
        </div>
        <datalist id="menu-category-list">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </section>

      {/* Item list */}
      <section aria-label="Menu items" className="rounded-2xl border border-white/10 bg-plum-900/80 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-cream-100/80">
            {ready ? `${menu.length} items` : "Loading menu…"}
          </h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15 bg-plum-950/60 text-cream-100/70 hover:bg-plum-800 hover:text-gold-400"
              >
                <RotateCcw className="size-4" aria-hidden /> Reset to website menu
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Reset to the website menu?</AlertDialogTitle>
                <AlertDialogDescription className="text-cream-100/60">
                  Replaces the current list with the standard Lassi Day Cafe menu from the public website. Your custom
                  items will be removed. Old bills are not affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/15 bg-transparent text-cream-100 hover:bg-white/10 hover:text-cream-100">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetToDefault();
                    toast.success("Menu reset to the website menu");
                  }}
                  className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
                >
                  Reset menu
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {!ready ? (
          <p className="text-sm text-cream-100/40">Loading menu…</p>
        ) : (
          <div className="scroll-area flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gold-400/80">{category}</h3>
                <ul className="flex flex-col gap-1.5">
                  {menu
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <MenuRow
                        key={item.id}
                        item={item}
                        categories={categories}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                      />
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
