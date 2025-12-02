import { MenuCard } from "@/components/MenuCard";
import { Button } from "@/components/ui/button";
import { Coffee, Mail } from "lucide-react";
import heroImage from "@/assets/cafe-hero.jpg";

const Index = () => {
  const coffeeDrinks = [
    { title: "Latte", options: ["Iced", "Hot"], icon: "☕" },
    { title: "Flat White", icon: "☕" },
    { title: "Cappuccino", icon: "☕" },
  ];

  const specialtyDrinks = [
    { title: "Matcha", options: ["Iced", "Hot"], icon: "🍵" },
    { title: "Colombian Hot Chocolate", icon: "🍫" },
  ];

  const syrups = ["Pumpkin Spice", "French Vanilla", "Vanilla"];
  const milks = ["Lactose Free Whole Milk", "Oat Milk"];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <Coffee className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-foreground tracking-wider">
            Welcome to My Home Café
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience artisanal coffee crafted with care in a cozy, intimate setting
          </p>
          <Button
            size="lg"
            className="bg-gradient-graffiti hover:opacity-90 text-primary-foreground shadow-spray text-lg px-8 py-6 font-bold uppercase tracking-wider"
            onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
          >
            Explore Menu
          </Button>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-foreground tracking-wider">Our Menu</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every drink is carefully prepared with premium ingredients and attention to detail
            </p>
          </div>

          {/* Coffee Drinks */}
          <div className="mb-16">
            <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-primary tracking-wide">Coffee Classics</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coffeeDrinks.map((drink, idx) => (
                <div key={idx} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-fade-in">
                  <MenuCard {...drink} />
                </div>
              ))}
            </div>
          </div>

          {/* Specialty Drinks */}
          <div className="mb-16">
            <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-secondary tracking-wide">Specialty Drinks</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {specialtyDrinks.map((drink, idx) => (
                <div key={idx} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-fade-in">
                  <MenuCard {...drink} />
                </div>
              ))}
            </div>
          </div>

          {/* Customizations */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-sm shadow-elevated border-l-4 border-primary">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground flex items-center gap-2 tracking-wide">
                <span>🧪</span> Flavor Syrups
              </h3>
              <div className="flex flex-wrap gap-3">
                {syrups.map((syrup, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-accent/20 text-accent-foreground rounded-sm border-2 border-accent font-medium uppercase text-sm tracking-wide"
                  >
                    {syrup}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-card p-8 rounded-sm shadow-elevated border-l-4 border-secondary">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground flex items-center gap-2 tracking-wide">
                <span>🥛</span> Milk Options
              </h3>
              <div className="flex flex-wrap gap-3">
                {milks.map((milk, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-accent/20 text-accent-foreground rounded-sm border-2 border-accent font-medium uppercase text-sm tracking-wide"
                  >
                    {milk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 bg-gradient-warm">
        <div className="max-w-4xl mx-auto text-center">
          <Mail className="w-12 h-12 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-wider">Visit Us</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our home café operates by appointment. Get in touch to schedule your visit and enjoy a
            personalized coffee experience.
          </p>
          <Button
            size="lg"
            className="bg-gradient-graffiti hover:opacity-90 text-primary-foreground shadow-spray text-lg px-8 py-6 font-bold uppercase tracking-wider"
          >
            Book Your Visit
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2024 My Home Café. Crafted with love and caffeine.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
