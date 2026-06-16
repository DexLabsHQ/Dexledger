const steps = [
  {
    step: "01",
    title: "Set up your business",
    description:
      "Tell us your business name and type. Choose which modules you need — inventory, credit tracking, expiry tracking.",
  },
  {
    step: "02",
    title: "Add products & customers",
    description:
      "Import or add your stock and your regular customers. DexLedger adapts to how your business already works.",
  },
  {
    step: "03",
    title: "Record day-to-day activity",
    description:
      "Log purchases, payments, and stock changes as they happen. Balances and reports update automatically.",
  },
  {
    step: "04",
    title: "Get reports on WhatsApp",
    description:
      "Connect your WhatsApp number to receive daily summaries, low stock alerts, and outstanding credit reports.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border/60 bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            From signup to your first WhatsApp report in under a day.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step}>
              <span className="text-sm font-semibold text-accent">{item.step}</span>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
