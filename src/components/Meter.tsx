export function Meter({
  value,
  color = 'var(--cyan-400)',
}: {
  value: number;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="meter">
      <i
        style={{
          width: `${clamped}%`,
          background: `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 9px)`,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
    </div>
  );
}
