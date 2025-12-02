import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, onSnapshot, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/logo.png";

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

type OrderDoc = {
  drink?: string;
  temperature?: string | null;
  shots?: string | null;
  milk?: string | null;
  sweetener?: string | null;
  name?: string | null;
  createdAt?: Timestamp | null;
  summaryLines?: string[];
   status?: string | null;
};

type Order = {
  id: string;
  drink: string;
  temperature?: string | null;
  shots?: string | null;
  milk?: string | null;
  sweetener?: string | null;
  name?: string | null;
  createdAt?: Date | null;
  summaryLines?: string[];
  status: string;
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: Order[] = snapshot.docs.map((doc) => {
          const data = doc.data() as OrderDoc;
          return {
            id: doc.id,
            drink: data.drink ?? "Unknown drink",
            temperature: data.temperature ?? null,
            shots: data.shots ?? null,
            milk: data.milk ?? null,
            sweetener: data.sweetener ?? null,
            name: data.name ?? null,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
            summaryLines: data.summaryLines,
            status: data.status ?? "pending",
          };
        });
        setOrders(next);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load orders:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: nextStatus });
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Snowfall />
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
                Orders dashboard · live queue
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-full text-xs uppercase tracking-[0.18em]"
          >
            <Link to="/">Back to menu</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <p className="text-xs text-muted-foreground/80">
              Once a guest submits an order from the menu, it will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">Recent orders</h2>
              <p className="text-xs text-muted-foreground">
                Showing {orders.length} order{orders.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="space-y-3">
              {orders.map((order) => {
                const timeLabel = order.createdAt
                  ? order.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Time unknown";

                const isDimmed = order.status === "served" || order.status === "cancelled";

                return (
                  <Card
                    key={order.id}
                    className={`flex flex-col justify-between border-border/60 bg-card/70 backdrop-blur-sm transition-opacity ${
                      isDimmed ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base md:text-lg">{order.drink}</CardTitle>
                            <Badge
                              variant="outline"
                              className="text-[0.65rem] uppercase tracking-[0.2em]"
                            >
                              {timeLabel}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs md:text-sm">
                            {order.name ? (
                              <span>For {order.name.toUpperCase()}</span>
                            ) : (
                              "No name provided"
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-start gap-1 md:items-end">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[9.5rem] rounded-full border-border/70 bg-background/80 text-xs uppercase tracking-[0.16em]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In progress</SelectItem>
                              <SelectItem value="served">Served</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 border-t border-border/40 pt-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-2">
                        {order.shots && (
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                          >
                            {order.shots}
                          </Badge>
                        )}
                        {order.temperature && (
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                          >
                            {order.temperature}
                          </Badge>
                        )}
                        {order.milk && (
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                          >
                            {order.milk}
                          </Badge>
                        )}
                        {order.sweetener && (
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[0.65rem] uppercase tracking-[0.18em]"
                          >
                            {order.sweetener}
                          </Badge>
                        )}
                      </div>
                      {order.summaryLines && order.summaryLines.length > 0 && (
                        <div className="mt-1 rounded-md bg-muted/40 p-2 text-[0.7rem] leading-relaxed">
                          {order.summaryLines.map((line, idx) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;


