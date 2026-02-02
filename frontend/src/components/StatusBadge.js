export const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
    assigned: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    picked_up: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    in_transit: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
    delivered: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    completed: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    rescheduled: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};
