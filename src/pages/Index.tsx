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

type Drink = {
  title: string;
  options?: string[];
  comingSoon?: boolean;
};

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
  const coffeeDrinks: Drink[] = [
    {
      title: "Latte",
      options: ["Iced", "Hot"],
    },
    {
      title: "Americano",
      options: ["Iced", "Hot"],
    },
    {
      title: "Flat White",
      options: ["Hot"],
    },
    {
      title: "Cappuccino",
      options: ["Hot"],
    },
  ];

  const specialtyDrinks: Drink[] = [
    {
      title: "Matcha",
      options: ["Iced", "Hot"],
      comingSoon: true,
    },
    {
      title: "Colombian Hot Chocolate",
      options: ["Hot"],
    },
  ];
  const syrups = ["None", "SF Pumpkin Spice", "SF French Vanilla", "SF Vanilla"];
  const milks = ["Lactose-free Milk", "Oat Milk", "Eggnog"];

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [currentDrink, setCurrentDrink] = useState<string | null>(null);
  const [selectedMilk, setSelectedMilk] = useState(milks[0] ?? "");
  const [selectedSyrup, setSelectedSyrup] = useState(syrups[0] ?? "");
  const [selectedTemperature, setSelectedTemperature] = useState<string | null>(null);
  const [orderStep, setOrderStep] = useState<"options" | "name" | "animation" | "success">("options");
  const [customerName, setCustomerName] = useState("");

  const allDrinks: Drink[] = [...coffeeDrinks, ...specialtyDrinks];
  const activeDrink = allDrinks.find((drink) => drink.title === currentDrink) ?? null;
  const temperatureOptions = activeDrink?.options ?? [];
  const isHotChocolate = currentDrink === "Colombian Hot Chocolate";

  const openOrderFor = (title: string) => {
    const drink = allDrinks.find((d) => d.title === title);
    setCurrentDrink(title);
    if (drink?.options && drink.options.length > 0) {
      setSelectedTemperature(drink.options[0]);
    } else {
      setSelectedTemperature(null);
    }
    setSelectedMilk(milks[0] ?? "");
    setSelectedSyrup(syrups[0] ?? "");
    // If there are no customizable options (like Colombian Hot Chocolate),
    // jump straight to the name step.
    if (title === "Colombian Hot Chocolate") {
      setOrderStep("name");
    } else {
      setOrderStep("options");
    }
    setCustomerName("");
    setIsOrderOpen(true);
  };

  useEffect(() => {
    if (orderStep === "animation") {
      const timeout = setTimeout(() => {
        const drinkName = currentDrink ?? "Unknown drink";
        const temperatureLine = selectedTemperature
          ? `Temp: ${selectedTemperature}`
          : null;

        const includeMilkAndSyrup = !isHotChocolate;
        const milkLine =
          includeMilkAndSyrup && selectedMilk ? `Milk: ${selectedMilk}` : null;
        const syrupLine =
          includeMilkAndSyrup && selectedSyrup ? `Sweet: ${selectedSyrup}` : null;

        const nameLine = customerName
          ? `Name: ${customerName}`
          : "Name: (not provided)";

        const lines = [
          "==================",
          "",
          `Drink: ${drinkName}`,
          temperatureLine,
          milkLine,
          syrupLine,
          nameLine,
        ].filter(Boolean) as string[];

        const message = encodeURIComponent(lines.join("\n"));
        const whatsappUrl = `https://wa.me/14372603540?text=${message}`;

        if (typeof window !== "undefined") {
          window.open(whatsappUrl, "_blank");
        }

        setOrderStep("success");
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [orderStep, currentDrink, selectedTemperature, selectedMilk, selectedSyrup, customerName, isHotChocolate]);
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
                    Bienvenido a nuestra casita!
                  </h1>
                  <p className="max-w-xl text-base md:text-lg text-muted-foreground">
                  Welcome to our home! We’re genuinely happy to share this gingerbread house night with you. Please relax, make yourself comfortable, and enjoy a curated selection of our favorite drinks.
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
                  <div className="flex items-center justify-between gap-4">
                    <span>Eggnog Latte</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                      Coffee Classics
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Colombian Hot Chocolate</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                      Signature Sips
                    </span>
                  </div>
                  <div className="pt-2 text-xs text-muted-foreground/80">
                    Custom syrups, alternative milks, and iced options available.
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
                Thoughtful drinks, small but considered.
              </h2>
            </div>
            <p className="max-w-md text-sm md:text-base text-muted-foreground">
              Our beans are responsibly sourced from Colombia and roasted to a balanced medium roast for a smooth, rich cup.
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
                      className="animate-fade-in"
                    >
                      <MenuCard
                        {...drink}
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
                      className="animate-fade-in"
                    >
                      <MenuCard
                        {...drink}
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
                    Flavor Syrups
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {syrups.map((syrup, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] rounded-full border border-muted/60 bg-muted/15 text-foreground/80"
                      >
                        {syrup}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              {currentDrink ? `${currentDrink}` : "Order drink"}
            </DialogTitle>
            {!isHotChocolate && orderStep !== "animation" && orderStep !== "name" && orderStep !== "success" && (
              <DialogDescription>
                Choose your preferences for this drink.
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

              {!isHotChocolate && (
                <>
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

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Syrup
                    </Label>
                    <RadioGroup
                      value={selectedSyrup}
                      onValueChange={setSelectedSyrup}
                      className="grid gap-2 sm:grid-cols-2"
                    >
                      {syrups.map((syrup) => (
                        <label
                          key={syrup}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-2 text-sm hover:border-primary/60 transition-all duration-200 ${
                            selectedSyrup === syrup ? "opacity-100" : "opacity-50"
                          }`}
                        >
                          <RadioGroupItem value={syrup} />
                          <span>{syrup}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>
          )}

          {orderStep === "name" && (
            <div className="space-y-4 py-2 animate-fade-in">
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
                  onClick={() => (isHotChocolate ? setIsOrderOpen(false) : setOrderStep("options"))}
                  className="rounded-full"
                >
                  {isHotChocolate ? "Cancel" : "Back"}
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
            <p>© 2024 D&A Home Café. Crafted with love and caffeine.</p>
            <p className="uppercase tracking-[0.2em]">
              Small-batch &middot; At home &middot; With care
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Index;