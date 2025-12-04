import { useEffect, useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  subscribeToMenuItems,
  subscribeToMenuConfig,
  type MenuCategory,
  type MenuItem,
  type MenuConfig,
} from "@/lib/menu";

type Drink = MenuItem;

const Snowfall = () => {
  const flakes = Array.from({ length: 40 });

  return (
    <div className="snowfall-layer">
      {flakes.map((_, idx) => (
        <span
          key={idx}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * -12}s`,
            animationDuration: `${8 + Math.random() * 10}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
};

const Index = () => {
  const [menuItems, setMenuItems] = useState<Drink[]>([]);
  const [menuConfig, setMenuConfig] = useState<MenuConfig>({
    sweeteners: [],
    milks: [],
  });
  const sweeteners = menuConfig.sweeteners;
  const milks = menuConfig.milks;
  const shotOptions = ["2 shots", "1 shot"];

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [currentDrink, setCurrentDrink] = useState<string | null>(null);
  const [selectedMilk, setSelectedMilk] = useState(milks[0] ?? "");
  const [selectedSweetener, setSelectedSweetener] = useState(sweeteners[0] ?? "");
  const [selectedTemperature, setSelectedTemperature] = useState<string | null>(null);
  const [selectedShots, setSelectedShots] = useState(shotOptions[0] ?? "2 shots");
  const [orderStep, setOrderStep] = useState<"options" | "name" | "animation" | "success">("options");
  const [customerName, setCustomerName] = useState("");

  const visibleMenuItems = menuItems.filter((item) => item.isActive ?? true);
  const byCategory = (category: MenuCategory) =>
    visibleMenuItems.filter((item) => item.category === category);

  const coffeeDrinks = byCategory("coffee");
  const specialtyDrinks = byCategory("signature");

  const allDrinks: Drink[] = visibleMenuItems;
  const activeDrink = allDrinks.find((drink) => drink.title === currentDrink) ?? null;
  const temperatureOptions = activeDrink?.options ?? [];
  const isCoffeeDrink = activeDrink?.category === "coffee";
  const includeMilk = activeDrink?.allowMilk ?? false;
  const includeSweetener = activeDrink?.allowSweetener ?? false;
  const drinkDescription = activeDrink?.description ?? "";

  const heroPrimary =
    visibleMenuItems.find((item) => item.id === menuConfig.heroHighlightPrimaryId) ?? null;
  const heroSecondary =
    visibleMenuItems.find((item) => item.id === menuConfig.heroHighlightSecondaryId) ?? null;

  const heroTitle =
    menuConfig.heroTitle?.trim() || "Bienvenido a nuestra casita!";
  const heroBody =
    menuConfig.heroBody?.trim() ||
    "Welcome to our home! We’re genuinely happy to share this experience with you. Please relax, make yourself comfortable, and enjoy a curated selection of our favorite drinks.";
  const menuTitle =
    menuConfig.menuTitle?.trim() || "Thoughtful drinks, small but considered.";
  const menuBody =
    menuConfig.menuBody?.trim() ||
    "Our beans are responsibly sourced from Colombia and roasted to a balanced medium roast for a smooth, rich cup.";

  const buildSummaryLines = () => {
    if (!currentDrink) return [] as string[];
    const lines: string[] = [];

    let main = currentDrink;
    if (selectedTemperature) {
      main += ` • ${selectedTemperature}`;
    }
    if (isCoffeeDrink && selectedShots) {
      main += ` • ${selectedShots}`;
    }
    lines.push(main);

    if (includeMilk && selectedMilk) {
      lines.push(`Milk: ${selectedMilk}`);
    }
    if (includeSweetener && selectedSweetener && selectedSweetener !== "None") {
      lines.push(`Sweetener: ${selectedSweetener}`);
    }

    return lines;
  };

  useEffect(() => {
    const unsubscribe = subscribeToMenuItems(
      (items) => {
        setMenuItems(items);
      },
      (error) => {
        console.error("Failed to subscribe to menu items:", error);
        setMenuItems([]);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMenuConfig(
      (config) => {
        setMenuConfig(config);
      },
      (error) => {
        console.error("Failed to subscribe to menu config:", error);
        setMenuConfig({
          sweeteners: [],
          milks: [],
        });
      },
    );

    return () => unsubscribe();
  }, []);

  const openOrderFor = (title: string) => {
    const drink = allDrinks.find((d) => d.title === title);
    setCurrentDrink(title);
    if (drink?.options && drink.options.length > 0) {
      setSelectedTemperature(drink.options[0]);
    } else {
      setSelectedTemperature(null);
    }
    setSelectedShots(shotOptions[0] ?? "2 shots");
    setSelectedMilk(milks[0] ?? "");
    setSelectedSweetener(sweeteners[0] ?? "");
    setOrderStep("options");
    setCustomerName("");
    setIsOrderOpen(true);
  };

  useEffect(() => {
    if (orderStep === "animation") {
      const timeout = setTimeout(() => {
        const drinkName = currentDrink ?? "Unknown drink";
        const milkLine =
          includeMilk && selectedMilk ? `Milk: ${selectedMilk}` : null;
        const sweetenerLine =
          includeSweetener && selectedSweetener ? `Sweet: ${selectedSweetener}` : null;

        const summaryLines = (() => {
          if (!currentDrink) return [] as string[];
          const lines: string[] = [];

          let main = drinkName;
          if (selectedTemperature) {
            main += ` • ${selectedTemperature}`;
          }
          if (isCoffeeDrink && selectedShots) {
            main += ` • ${selectedShots}`;
          }
          lines.push(main);

          if (milkLine) {
            lines.push(milkLine);
          }
          if (sweetenerLine) {
            lines.push(sweetenerLine);
          }

          return lines;
        })();

        void (async () => {
          try {
            await addDoc(collection(db, "orders"), {
              drink: drinkName,
              temperature: selectedTemperature ?? null,
              shots: isCoffeeDrink ? selectedShots : null,
              milk: milkLine ? selectedMilk : null,
              sweetener: sweetenerLine ? selectedSweetener : null,
              name: customerName || null,
              summaryLines,
              createdAt: serverTimestamp(),
              status: "pending",
            });
          } catch (error) {
            // For now, just log the error; you could surface a toast if desired
            console.error("Failed to save order to Firestore:", error);
          } finally {
            setOrderStep("success");
          }
        })();
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [
    orderStep,
    currentDrink,
    selectedTemperature,
    selectedMilk,
    selectedSweetener,
    selectedShots,
    customerName,
    isCoffeeDrink,
    includeMilk,
    includeSweetener,
  ]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Snowfall />
      {/* Brand Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-start px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 md:h-20 md:w-20">
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
                Menú de café de temporada
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="mx-auto h-full max-w-6xl border-x border-border/40" />
        </div>

        <div className="relative z-10">
          <div className="container mx-auto px-4 pt-12 pb-20 lg:pb-28">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_minmax(0,1fr)] lg:items-end">
              <div className="space-y-8">
                <p className="inline-flex items-center rounded-full border border-border/60 px-4 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  House menu
                </p>

                <div className="space-y-4">
                  <h1 className="text-4xl leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    {heroTitle}
                  </h1>
                  <p className="max-w-xl text-base md:text-lg text-muted-foreground">
                    {heroBody}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary px-8 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
                    onClick={() =>
                      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Browse the menu
                  </Button>
                </div>
              </div>

              <aside className="rounded-3xl border border-border/60 bg-background/60 p-6 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Today&apos;s selection
                  </p>
                  <span className="rounded-full border border-muted/60 bg-muted/15 px-3 py-1 text-xs font-medium text-foreground/80">
                    Seasonal highlights
                  </span>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  {heroPrimary && (
                    <div className="flex items-center justify-between gap-4">
                      <span>{heroPrimary.title}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                        {heroPrimary.category === "coffee" ? "Coffee Classics" : "Signature Sips"}
                      </span>
                    </div>
                  )}
                  {heroSecondary && (
                    <div className="flex items-center justify-between gap-4">
                      <span>{heroSecondary.title}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                        {heroSecondary.category === "coffee" ? "Coffee Classics" : "Signature Sips"}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 text-xs text-muted-foreground/80">
                    Sweeteners, alternative milks, and iced options available.
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="border-t border-border/40 bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                The menu
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl">
                {menuTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm md:text-base text-muted-foreground">
              {menuBody}
            </p>
          </div>

          {/* Coffee Drinks & Specialty */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-10">
              <div>
                <h3 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  Coffee Classics
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {coffeeDrinks.map((drink, idx) => (
                    <div
                      key={idx}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      className="animate-fade-in h-full"
                    >
                      <MenuCard
                        {...drink}
                        description={drink.description}
                        onSelect={!drink.comingSoon ? () => openOrderFor(drink.title) : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden border-t border-border/40 pt-8 text-xs text-muted-foreground/80 md:block">
                All drinks are prepared on a small home bar set-up. Please allow a little extra time
                for care and conversation—and feel free to linger over the menu.
              </div>
            </div>

            {/* Customizations & Specialty */}
            <div className="space-y-10">
              <div>
                <h3 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  Signature Drinks
                </h3>
                <div className="mt-5 grid gap-4">
                  {specialtyDrinks.map((drink, idx) => (
                    <div
                      key={idx}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      className="animate-fade-in h-full"
                    >
                      <MenuCard
                        {...drink}
                        description={drink.description}
                        onSelect={!drink.comingSoon ? () => openOrderFor(drink.title) : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Customizations */}
              <div className="space-y-6 rounded-3xl border border-border/60 bg-card/40 p-6">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                    Sweeteners
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sweeteners.map((sweetener, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] rounded-full border border-muted/60 bg-muted/15 text-foreground/80"
                      >
                        {sweetener}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                    Milk Options
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {milks.map((milk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] rounded-full border border-muted/60 bg-muted/15 text-foreground/80"
                      >
                        {milk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order dialog */}
      <Dialog
        open={isOrderOpen}
        onOpenChange={(open) => {
          setIsOrderOpen(open);
          if (!open) {
            setOrderStep("options");
            setCustomerName("");
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              {currentDrink ? `${currentDrink}` : "Order drink"}
            </DialogTitle>
            {drinkDescription && (
              <DialogDescription className="mt-1">
                {drinkDescription}
              </DialogDescription>
            )}
          </DialogHeader>

          {orderStep === "options" && (
            <div className="space-y-6 py-2 animate-fade-in">
              {temperatureOptions.length > 1 && (
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Hot or iced
                  </Label>
                  <RadioGroup
                    value={selectedTemperature ?? ""}
                    onValueChange={setSelectedTemperature}
                    className="flex flex-wrap gap-3"
                  >
                    {temperatureOptions.map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-2 text-sm hover:border-primary/60 transition-all duration-200 ${
                          selectedTemperature === option ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {isCoffeeDrink && (
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Espresso shots
                  </Label>
                  <RadioGroup
                    value={selectedShots}
                    onValueChange={setSelectedShots}
                    className="flex flex-wrap gap-3"
                  >
                    {shotOptions.map((shots) => (
                      <label
                        key={shots}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-2 text-sm hover:border-primary/60 transition-all duration-200 ${
                          selectedShots === shots ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <RadioGroupItem value={shots} />
                        <span>{shots}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Our drinks regularly come with 2 shots; choose 1 shot if you prefer a milder coffee.
                  </p>
                </div>
              )}

              {includeMilk && (
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Milk
                  </Label>
                  <RadioGroup
                    value={selectedMilk}
                    onValueChange={setSelectedMilk}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {milks.map((milk) => (
                      <label
                        key={milk}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-2 text-sm hover:border-primary/60 transition-all duration-200 ${
                          selectedMilk === milk ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <RadioGroupItem value={milk} />
                        <span>{milk}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {includeSweetener && (
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Sweetener
                  </Label>
                  <RadioGroup
                    value={selectedSweetener}
                    onValueChange={setSelectedSweetener}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {sweeteners.map((sweetener) => (
                      <label
                        key={sweetener}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-2 text-sm hover:border-primary/60 transition-all duration-200 ${
                          selectedSweetener === sweetener ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <RadioGroupItem value={sweetener} />
                        <span>{sweetener}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {orderStep === "name" && (
            <div className="space-y-5 py-2 animate-fade-in">
              {(() => {
                const summaryLines = buildSummaryLines();
                if (summaryLines.length === 0) return null;
                const [primaryLine, ...detailLines] = summaryLines;

                return (
                  <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card/70 to-background p-4 text-xs shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Order summary
                      </p>
                      <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                        Review before sending
                      </span>
                    </div>
                    <div className="space-y-2 text-foreground">
                      <p className="text-sm font-medium leading-snug">{primaryLine}</p>
                      {detailLines.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {detailLines.map((line, idx) => (
                            <span
                              key={idx}
                              className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                            >
                              {line}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Your name
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Who should we make this for?"
                  className="bg-card/60"
                />
              </div>
            </div>
          )}

          {orderStep === "animation" && (
            <div className="py-4 animate-fade-in">
              <div className="latte-loader">
                <div className="latte-cup-wrapper">
                  <div className="latte-steam">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="latte-stream" />
                  <div className="latte-cup">
                    <div className="latte-liquid" />
                  </div>
                  <div className="latte-handle" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Getting your order ready...
                </p>
              </div>
            </div>
          )}

          {orderStep === "success" && (
            <div className="py-4 animate-fade-in">
              <div className="latte-loader">
                <div className="wink-avatar">
                  <div className="wink-face">
                    <div className="wink-eye wink-eye--left" />
                    <div className="wink-eye wink-eye--right" />
                    <div className="wink-smile" />
                    <div className="wink-cheek wink-cheek--left" />
                    <div className="wink-cheek wink-cheek--right" />
                  </div>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {customerName
                    ? `${customerName}, your drink will be ready soon!`
                    : "Your drink will be ready soon!"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            {orderStep === "options" && (
              <>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsOrderOpen(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setOrderStep("name")}
                  className="rounded-full"
                >
                  Next
                </Button>
              </>
            )}

            {orderStep === "name" && (
              <>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOrderStep("options")}
                  className="rounded-full"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setOrderStep("animation")}
                  className="rounded-full"
                  disabled={!customerName.trim()}
                >
                  Submit order
                </Button>
              </>
            )}

            {orderStep === "animation" && (
              <Button
                variant="outline"
                type="button"
                disabled
                className="rounded-full opacity-60"
              >
                Preparing...
              </Button>
            )}

            {orderStep === "success" && (
              <Button
                variant="outline"
                type="button"
                className="rounded-full"
                onClick={() => {
                  setIsOrderOpen(false);
                  setOrderStep("options");
                  setCustomerName("");
                }}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground/80 md:flex-row">
            <p>© 2025 D&A Home Café. Crafted with love and caffeine.</p>
            <div className="flex flex-col items-center gap-2 text-center md:flex-row md:gap-4">
              <p className="uppercase tracking-[0.2em]">
                Small-batch &middot; At home &middot; With care
              </p>
              <Link
                to="/orders"
                className="text-[0.7rem] uppercase tracking-[0.2em] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
              >
                View orders
              </Link>
              <Link
                to="/qr"
                className="text-[0.7rem] uppercase tracking-[0.2em] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
              >
                QR
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Index;