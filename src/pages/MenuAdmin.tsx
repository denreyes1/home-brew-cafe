import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuCard } from "@/components/MenuCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  subscribeToMenuItems,
  subscribeToMenuConfig,
  saveMenuConfig,
  type MenuCategory,
  type MenuItem,
  type MenuConfig,
} from "@/lib/menu";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  id?: string;
  title: string;
  category: MenuCategory;
  options: string[];
  comingSoon: boolean;
  isActive: boolean;
  description: string;
  allowMilk: boolean;
  allowSweetener: boolean;
};

const TEMPERATURE_OPTIONS = ["Hot", "Iced"] as const;

const defaultFormState: FormState = {
  title: "",
  category: "coffee",
  options: ["Hot", "Iced"],
  comingSoon: false,
  isActive: true,
  description: "",
  allowMilk: true,
  allowSweetener: true,
};

const MenuAdmin = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [config, setConfig] = useState<MenuConfig>({
    sweeteners: [],
    milks: [],
    heroHighlightPrimaryId: null,
    heroHighlightSecondaryId: null,
    heroTitle: "",
    heroBody: "",
    menuTitle: "",
    menuBody: "",
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [newSweetener, setNewSweetener] = useState("");
  const [newMilk, setNewMilk] = useState("");
  const [configDrag, setConfigDrag] = useState<{
    type: "sweetener" | "milk";
    fromIndex: number;
  } | null>(null);
  const { toast } = useToast();

  const heroTitlePlaceholder =
    (config.heroTitle ?? "").trim() || "Bienvenido a nuestra casita!";
  const heroBodyPlaceholder =
    (config.heroBody ?? "").trim() ||
    "Welcome to our home! We’re genuinely happy to share this experience with you. Please relax, make yourself comfortable, and enjoy a curated selection of our favorite drinks.";
  const menuTitlePlaceholder =
    (config.menuTitle ?? "").trim() || "Thoughtful drinks, small but considered.";
  const menuBodyPlaceholder =
    (config.menuBody ?? "").trim() ||
    "Our beans are responsibly sourced from Colombia and roasted to a balanced medium roast for a smooth, rich cup.";

  useEffect(() => {
    const unsubscribe = subscribeToMenuItems(
      (next) => {
        setItems(next);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to menu items:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMenuConfig(
      (nextConfig) => {
        setConfig(nextConfig);
      },
      (error) => {
        console.error("Failed to subscribe to menu config:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  const coffeeItems = useMemo(
    () => items.filter((item) => item.category === "coffee"),
    [items],
  );
  const signatureItems = useMemo(
    () => items.filter((item) => item.category === "signature"),
    [items],
  );
  const activeItems = useMemo(
    () => items.filter((item) => item.isActive ?? true),
    [items],
  );

  const [dragState, setDragState] = useState<{
    category: MenuCategory;
    fromIndex: number;
  } | null>(null);

  const handleReorder = async (
    category: MenuCategory,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;

    const sourceItems = category === "coffee" ? coffeeItems : signatureItems;
    if (
      fromIndex < 0 ||
      fromIndex >= sourceItems.length ||
      toIndex < 0 ||
      toIndex >= sourceItems.length
    ) {
      return;
    }

    const updated = [...sourceItems];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    try {
      // Space sort orders by 10 so we have room for future inserts.
      await Promise.all(
        updated.map((item, index) =>
          updateMenuItem(item.id, { sortOrder: (index + 1) * 10 }),
        ),
      );
    } catch (error) {
      console.error("Failed to reorder menu items:", error);
      toast({
        title: "Couldn't update order",
        description: "Your drag was not saved. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      title: item.title,
      category: item.category,
      options: item.options.length ? item.options : ["Hot"],
      comingSoon: item.comingSoon ?? false,
      isActive: item.isActive ?? true,
      description: item.description ?? "",
      allowMilk: item.allowMilk ?? true,
      allowSweetener: item.allowSweetener ?? true,
    });
  };

  const handleReset = () => {
    setForm(defaultFormState);
  };

  const toggleOption = (option: (typeof TEMPERATURE_OPTIONS)[number]) => {
    setForm((prev) => {
      const hasOption = prev.options.includes(option);
      const nextOptions = hasOption
        ? prev.options.filter((o) => o !== option)
        : [...prev.options, option];

      return {
        ...prev,
        options: nextOptions.length ? nextOptions : [option],
      };
    });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast({
        title: "Add a name for the drink",
        description: "Every menu item should have a clear, inviting title.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const basePayload = {
        title: form.title.trim(),
        category: form.category,
        options: form.options,
        comingSoon: form.comingSoon,
        isActive: form.isActive,
        description: form.description.trim(),
        allowMilk: form.allowMilk,
        allowSweetener: form.allowSweetener,
      };

      if (form.id) {
        await updateMenuItem(form.id, basePayload);
        toast({
          title: "Menu item updated",
          description: `"${form.title}" has been refreshed on the menu.`,
        });
      } else {
        const categoryItems =
          form.category === "coffee" ? coffeeItems : signatureItems;
        const lastSortOrder =
          categoryItems.length > 0
            ? categoryItems[categoryItems.length - 1].sortOrder ??
              (categoryItems.length - 1) * 10
            : 0;
        const nextSortOrder = lastSortOrder + 10;

        await createMenuItem({
          ...basePayload,
          sortOrder: nextSortOrder,
        });
        toast({
          title: "Menu item added",
          description: `"${form.title}" is now part of your cafe menu.`,
        });
      }

      setForm(defaultFormState);
    } catch (error) {
      console.error("Failed to save menu item:", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't save that menu item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    const title = form.title || "this drink";
    const confirmed =
      window.confirm?.(`Remove "${title}" from the menu? This cannot be undone.`) ?? true;
    if (!confirmed) return;

    setSaving(true);
    try {
      await deleteMenuItem(form.id);
      toast({
        title: "Menu item removed",
        description: `"${title}" has been deleted from the menu.`,
      });
      setForm(defaultFormState);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast({
        title: "Couldn't delete item",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSweetener = () => {
    const value = newSweetener.trim();
    if (!value) return;
    if (config.sweeteners.includes(value)) {
      setNewSweetener("");
      return;
    }
    setConfig((prev) => ({ ...prev, sweeteners: [...prev.sweeteners, value] }));
    setNewSweetener("");
  };

  const handleRemoveSweetener = (value: string) => {
    setConfig((prev) => ({
      ...prev,
      sweeteners: prev.sweeteners.filter((item) => item !== value),
    }));
  };

  const handleAddMilk = () => {
    const value = newMilk.trim();
    if (!value) return;
    if (config.milks.includes(value)) {
      setNewMilk("");
      return;
    }
    setConfig((prev) => ({ ...prev, milks: [...prev.milks, value] }));
    setNewMilk("");
  };

  const handleRemoveMilk = (value: string) => {
    setConfig((prev) => ({
      ...prev,
      milks: prev.milks.filter((item) => item !== value),
    }));
  };

  const handleSaveConfig = async () => {
    setConfigSaving(true);
    try {
      await saveMenuConfig(config);
      toast({
        title: "Options updated",
        description: "Sweeteners and milk options have been saved.",
      });
    } catch (error) {
      console.error("Failed to save menu config:", error);
      toast({
        title: "Couldn't save options",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 md:h-16 md:w-16">
              <div className="absolute inset-0 rounded-full bg-primary/25 blur-md" />
              <img
                src={logo}
                alt="D&A Café"
                className="relative h-full w-full rounded-full border border-primary/70 object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                D&A Home Café
              </p>
              <p className="text-xs text-muted-foreground/80">
                Menu studio · add and update drinks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="hidden rounded-full text-xs uppercase tracking-[0.18em] sm:inline-flex"
            >
              <Link to="/orders">Orders</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full text-xs uppercase tracking-[0.18em]"
            >
              <Link to="/">Back to menu</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] lg:items-start">
          <section aria-label="Menu editor" className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Menu editor
              </p>
              <h1 className="mt-3 text-2xl md:text-3xl lg:text-4xl">
                Add a new drink or refine an existing one.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this space to keep your cafe menu feeling intentional, seasonal, and easy to
                scan for guests.
              </p>
            </div>

            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {form.id ? "Edit menu item" : "New menu item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs uppercase tracking-[0.2em]">
                      Drink name
                    </Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                      placeholder="e.g. Latte"
                      className="bg-card/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs uppercase tracking-[0.2em]">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                      placeholder="A short, inviting description for this drink"
                      className="min-h-[72px] w-full rounded-md border border-input bg-card/80 px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.2em]">
                        Category
                      </Label>
                      <div className="flex gap-2">
                        {(["coffee", "signature"] as MenuCategory[]).map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                category,
                              }))
                            }
                            className={`flex-1 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition-all ${
                              form.category === category
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/70 bg-card/60 text-foreground/80 hover:border-primary/50"
                            }`}
                          >
                            {category === "coffee" ? "Coffee classics" : "Signature drinks"}
                          </button>
                        ))}
                      </div>
                      <p className="text-[0.7rem] text-muted-foreground">
                        Drag items in the list on the right to adjust their order.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                        <div>
                          <Label className="text-xs uppercase tracking-[0.2em]">
                            Milk customization
                          </Label>
                          <p className="text-[0.7rem] text-muted-foreground">
                            Allow guests to choose a milk option for this drink.
                          </p>
                        </div>
                        <Switch
                          checked={form.allowMilk}
                          onCheckedChange={(checked) =>
                            setForm((prev) => ({ ...prev, allowMilk: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                        <div>
                          <Label className="text-xs uppercase tracking-[0.2em]">
                            Sweetener customization
                          </Label>
                          <p className="text-[0.7rem] text-muted-foreground">
                            Allow guests to choose a sweetener for this drink.
                          </p>
                        </div>
                        <Switch
                          checked={form.allowSweetener}
                          onCheckedChange={(checked) =>
                            setForm((prev) => ({ ...prev, allowSweetener: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-[0.2em]">
                      Temperature options
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {TEMPERATURE_OPTIONS.map((option) => {
                        const isActive = form.options.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleOption(option)}
                            className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition-all ${
                              isActive
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/70 bg-card/60 text-foreground/80 hover:border-primary/50"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
                      <div>
                        <Label className="text-xs uppercase tracking-[0.2em]">
                          Coming soon
                        </Label>
                        <p className="text-[0.7rem] text-muted-foreground">
                          Mark this drink as a teaser. Guests will see a subtle badge.
                        </p>
                      </div>
                      <Switch
                        checked={form.comingSoon}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({ ...prev, comingSoon: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
                      <div>
                        <Label className="text-xs uppercase tracking-[0.2em]">
                          Visible
                        </Label>
                        <p className="text-[0.7rem] text-muted-foreground">
                          Toggle to quietly hide this drink from the public menu.
                        </p>
                      </div>
                      <Switch
                        checked={form.isActive}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({ ...prev, isActive: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="rounded-full px-6 text-xs uppercase tracking-[0.18em]"
                        disabled={saving}
                      >
                        {form.id ? "Save changes" : "Add to menu"}
                      </Button>
                      {form.id && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full text-xs uppercase tracking-[0.18em]"
                            onClick={handleReset}
                            disabled={saving}
                          >
                            New item
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="rounded-full text-xs uppercase tracking-[0.18em]"
                            onClick={handleDelete}
                            disabled={saving}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Changes sync instantly across devices.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <section aria-label="Preview" className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Live preview
              </p>
              <div className="max-w-md">
                <MenuCard
                  title={form.title || "Your new drink"}
                  description={undefined}
                  options={form.options}
                  comingSoon={form.comingSoon}
                />
              </div>
            </section>
          </section>

          <section aria-label="Existing menu items and global options" className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Current menu
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tap a drink to edit its details, order, or visibility.
                  </p>
                </div>
                <Badge variant="outline" className="text-[0.7rem] uppercase tracking-[0.18em]">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </Badge>
              </div>

              {loading ? (
                <div className="flex min-h-[12rem] items-center justify-center text-sm text-muted-foreground">
                  Loading menu…
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                  <p>No menu items yet.</p>
                  <p className="mt-1 text-[0.8rem]">
                    Start by adding your house favorites on the left&mdash;once saved, they&apos;ll
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Coffee classics
                      </h2>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {coffeeItems.length} item{coffeeItems.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {coffeeItems.map((item, index) => {
                        const isSelected = form.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            draggable
                            onClick={() => handleEdit(item)}
                            onDragStart={() =>
                              setDragState({ category: "coffee", fromIndex: index })
                            }
                            onDragOver={(event) => {
                              event.preventDefault();
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              if (
                                dragState &&
                                dragState.category === "coffee" &&
                                dragState.fromIndex !== undefined
                              ) {
                                void handleReorder("coffee", dragState.fromIndex, index);
                              }
                              setDragState(null);
                            }}
                            onDragEnd={() => setDragState(null)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                              isSelected
                                ? "border-primary bg-card"
                                : "border-border/60 bg-card/40 hover:border-primary/60"
                            }`}
                          >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{item.title}</span>
                              {!item.isActive && (
                                <Badge
                                  variant="secondary"
                                  className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                                >
                                  Hidden
                                </Badge>
                              )}
                              {item.comingSoon && (
                                <Badge
                                  variant="outline"
                                  className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                                >
                                  Coming soon
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1 text-[0.7rem] text-muted-foreground">
                              {item.options.map((option) => (
                                <span key={option}>{option}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[0.7rem] text-muted-foreground">
                              #{index + 1}
                            </span>
                            <span className="text-[0.7rem] text-muted-foreground/80">
                              Drag to reorder · Tap to edit
                            </span>
                          </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Signature drinks
                      </h2>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {signatureItems.length} item{signatureItems.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {signatureItems.map((item, index) => {
                        const isSelected = form.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            draggable
                            onClick={() => handleEdit(item)}
                            onDragStart={() =>
                              setDragState({ category: "signature", fromIndex: index })
                            }
                            onDragOver={(event) => {
                              event.preventDefault();
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              if (
                                dragState &&
                                dragState.category === "signature" &&
                                dragState.fromIndex !== undefined
                              ) {
                                void handleReorder("signature", dragState.fromIndex, index);
                              }
                              setDragState(null);
                            }}
                            onDragEnd={() => setDragState(null)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                              isSelected
                                ? "border-primary bg-card"
                                : "border-border/60 bg-card/40 hover:border-primary/60"
                            }`}
                          >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{item.title}</span>
                              {!item.isActive && (
                                <Badge
                                  variant="secondary"
                                  className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                                >
                                  Hidden
                                </Badge>
                              )}
                              {item.comingSoon && (
                                <Badge
                                  variant="outline"
                                  className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                                >
                                  Coming soon
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1 text-[0.7rem] text-muted-foreground">
                              {item.options.map((option) => (
                                <span key={option}>{option}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[0.7rem] text-muted-foreground">
                              #{index + 1}
                            </span>
                            <span className="text-[0.7rem] text-muted-foreground/80">
                              Drag to reorder · Tap to edit
                            </span>
                          </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Global options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs uppercase tracking-[0.2em]">
                        Sweeteners
                      </Label>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {config.sweeteners.length} option
                        {config.sweeteners.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder='e.g. "Sugar"'
                        value={newSweetener}
                        onChange={(event) => setNewSweetener(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleAddSweetener();
                          }
                        }}
                        className="bg-card/80 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full text-[0.7rem] uppercase tracking-[0.18em]"
                        onClick={handleAddSweetener}
                      >
                        Add
                      </Button>
                    </div>
                    {config.sweeteners.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {config.sweeteners.map((value, index) => (
                          <button
                            key={value}
                            type="button"
                            draggable
                            onClick={() => handleRemoveSweetener(value)}
                            onDragStart={() =>
                              setConfigDrag({ type: "sweetener", fromIndex: index })
                            }
                            onDragOver={(event) => {
                              event.preventDefault();
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              if (
                                configDrag &&
                                configDrag.type === "sweetener" &&
                                configDrag.fromIndex !== index
                              ) {
                                setConfig((prev) => {
                                  const updated = [...prev.sweeteners];
                                  const [moved] = updated.splice(configDrag.fromIndex, 1);
                                  updated.splice(index, 0, moved);
                                  return { ...prev, sweeteners: updated };
                                });
                              }
                              setConfigDrag(null);
                            }}
                            onDragEnd={() => setConfigDrag(null)}
                            className="group flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[0.7rem] text-foreground/80 hover:border-destructive/60 hover:text-destructive"
                          >
                            <span>{value}</span>
                            <span className="text-xs opacity-60 group-hover:opacity-100">×</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs uppercase tracking-[0.2em]">
                        Milk options
                      </Label>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {config.milks.length} option
                        {config.milks.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder='e.g. "Oat Milk"'
                        value={newMilk}
                        onChange={(event) => setNewMilk(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleAddMilk();
                          }
                        }}
                        className="bg-card/80 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full text-[0.7rem] uppercase tracking-[0.18em]"
                        onClick={handleAddMilk}
                      >
                        Add
                      </Button>
                    </div>
                    {config.milks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {config.milks.map((value, index) => (
                          <button
                            key={value}
                            type="button"
                            draggable
                            onClick={() => handleRemoveMilk(value)}
                            onDragStart={() =>
                              setConfigDrag({ type: "milk", fromIndex: index })
                            }
                            onDragOver={(event) => {
                              event.preventDefault();
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              if (
                                configDrag &&
                                configDrag.type === "milk" &&
                                configDrag.fromIndex !== index
                              ) {
                                setConfig((prev) => {
                                  const updated = [...prev.milks];
                                  const [moved] = updated.splice(configDrag.fromIndex, 1);
                                  updated.splice(index, 0, moved);
                                  return { ...prev, milks: updated };
                                });
                              }
                              setConfigDrag(null);
                            }}
                            onDragEnd={() => setConfigDrag(null)}
                            className="group flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[0.7rem] text-foreground/80 hover:border-destructive/60 hover:text-destructive"
                          >
                            <span>{value}</span>
                            <span className="text-xs opacity-60 group-hover:opacity-100">×</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5 border-t border-border/40 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs uppercase tracking-[0.2em]">
                        Today&apos;s selection
                      </Label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <p className="text-[0.7rem] text-muted-foreground uppercase tracking-[0.18em]">
                          Primary highlight
                        </p>
                        <Select
                          value={config.heroHighlightPrimaryId ?? "none"}
                          onValueChange={(value) =>
                            setConfig((prev) => ({
                              ...prev,
                              heroHighlightPrimaryId: value === "none" ? null : value,
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 rounded-full border-border/70 bg-background/80 text-xs uppercase tracking-[0.16em]">
                            <SelectValue placeholder="Choose drink" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {activeItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[0.7rem] text-muted-foreground uppercase tracking-[0.18em]">
                          Secondary highlight
                        </p>
                        <Select
                          value={config.heroHighlightSecondaryId ?? "none"}
                          onValueChange={(value) =>
                            setConfig((prev) => ({
                              ...prev,
                              heroHighlightSecondaryId: value === "none" ? null : value,
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 rounded-full border-border/70 bg-background/80 text-xs uppercase tracking-[0.16em]">
                            <SelectValue placeholder="Choose drink" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {activeItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      These drinks appear in the small highlight card on the home page.
                    </p>
                  </div>

                  <div className="grid gap-5 border-t border-border/40 pt-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.2em]">
                        Hero heading
                      </Label>
                      <Input
                        value={config.heroTitle ?? ""}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            heroTitle: event.target.value,
                          }))
                        }
                        placeholder={heroTitlePlaceholder}
                        className="bg-card/80 text-xs md:text-sm"
                      />
                      <Label className="mt-3 text-xs uppercase tracking-[0.2em]">
                        Hero body
                      </Label>
                      <textarea
                        value={config.heroBody ?? ""}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            heroBody: event.target.value,
                          }))
                        }
                        placeholder={heroBodyPlaceholder}
                        className="min-h-[80px] w-full rounded-md border border-input bg-card/80 px-3 py-2 text-xs md:text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.2em]">
                        Menu heading
                      </Label>
                      <Input
                        value={config.menuTitle ?? ""}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            menuTitle: event.target.value,
                          }))
                        }
                        placeholder={menuTitlePlaceholder}
                        className="bg-card/80 text-xs md:text-sm"
                      />
                      <Label className="mt-3 text-xs uppercase tracking-[0.2em]">
                        Menu body
                      </Label>
                      <textarea
                        value={config.menuBody ?? ""}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            menuBody: event.target.value,
                          }))
                        }
                        placeholder={menuBodyPlaceholder}
                        className="min-h-[80px] w-full rounded-md border border-input bg-card/80 px-3 py-2 text-xs md:text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="text-[0.7rem] text-muted-foreground">
                      All global options sync to the public menu and order flow.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full px-5 text-[0.7rem] uppercase tracking-[0.18em]"
                      onClick={handleSaveConfig}
                      disabled={configSaving}
                    >
                      Save options
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MenuAdmin;


