import { statusLabels, statusColors } from "@/data/mockData";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const label = statusLabels[status] || status;
  const colors = statusColors[status] || "bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors} ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
