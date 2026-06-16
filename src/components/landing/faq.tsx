const faqs = [
  {
    question: "Is DexLedger only for pharmacies?",
    answer:
      "No. DexLedger works for any local business that manages stock, customers, and credit — grocery stores, hardware shops, stationery shops, cement suppliers, distributors, warehouses, and more. You choose your business type during setup, and the dashboard adapts.",
  },
  {
    question: "How is my outstanding balance calculated?",
    answer:
      "Outstanding balance is never entered manually. It's calculated automatically from every purchase and payment recorded in a customer's ledger, so it's always accurate and auditable.",
  },
  {
    question: "Can I keep my data separate from other businesses on the platform?",
    answer:
      "Yes. DexLedger is multi-tenant by design — every business's data is isolated with database-level security policies. Your products, customers, and reports are only ever visible to you.",
  },
  {
    question: "Do I need WhatsApp Business to receive reports?",
    answer:
      "WhatsApp report delivery is a premium feature. You connect your WhatsApp number once, and DexLedger sends low stock alerts, outstanding credit reports, and daily/weekly summaries directly to it.",
  },
  {
    question: "Can I export my reports?",
    answer:
      "Yes. Low stock reports, outstanding credit reports, inventory summaries, and customer summaries can all be exported as CSV or Excel files.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-10 divide-y divide-border">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
