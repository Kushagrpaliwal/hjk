export default function StatusBadge({ status }) {
    const styles = {
        Active: "border-green-200 bg-green-50 text-green-600",
        Approved: "border-green-200 bg-green-50 text-green-600",
        Completed: "border-green-200 bg-green-50 text-green-600",
        Pending: "border-amber-200 bg-amber-50 text-amber-600",
        "In Progress": "border-indigo-200 bg-indigo-50 text-indigo-600",
        Suspended: "border-red-200 bg-red-50 text-red-600",
        Rejected: "border-red-200 bg-red-50 text-red-600",
        Cancelled: "border-slate-200 bg-slate-100 text-slate-500",
    };

    const badgeClass = styles[status] || styles.Pending;

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}
