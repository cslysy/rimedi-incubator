interface FlowSummaryItem {
  label: string;
  value: string;
}

interface FlowSummaryProps {
  items: FlowSummaryItem[];
}

export function FlowSummary({ items }: FlowSummaryProps) {
  const visibleItems = items.filter((item) => item.value.trim().length > 0);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="flowSummary" aria-label="Wybrane dane">
      {visibleItems.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
