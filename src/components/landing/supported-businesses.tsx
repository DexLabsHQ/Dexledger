import {
  Pill,
  ShoppingBasket,
  Hammer,
  PencilRuler,
  Truck,
  Boxes,
  Warehouse,
  Building2,
} from "lucide-react";

const businesses = [
  { icon: Pill, label: "Pharmacies" },
  { icon: ShoppingBasket, label: "Grocery Stores" },
  { icon: Hammer, label: "Hardware Stores" },
  { icon: PencilRuler, label: "Stationery Shops" },
  { icon: Building2, label: "Cement Suppliers" },
  { icon: Truck, label: "Distributors" },
  { icon: Warehouse, label: "Warehouses" },
  { icon: Boxes, label: "And more" },
];

export function SupportedBusinesses() {
  return (
    <section id="businesses" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for how local businesses actually run
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            One platform, configured for your kind of business — not a generic
            inventory tool stretched to fit.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {businesses.map((b) => (
            <div
              key={b.label}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-8 text-center transition-colors hover:border-accent/40"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-foreground">
                <b.icon className="size-5" />
              </div>
              <p className="text-sm font-medium">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
