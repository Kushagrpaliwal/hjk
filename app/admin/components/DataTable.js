"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DataTable({ columns, data, itemsPerPage = 8, flexWrapper = false }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const wrapperClass = flexWrapper ? "flex flex-1 min-h-0 flex-col" : "flex flex-col";

    return (
        <div className={`${wrapperClass} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}>
            <div className="min-h-0 flex-1 overflow-auto">
                <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`whitespace-nowrap border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 ${col.className || ""}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-slate-400">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                                        idx === paginatedData.length - 1 ? "border-b-0" : ""
                                    }`}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`whitespace-nowrap px-5 py-3.5 text-[13.5px] font-medium text-slate-800 ${
                                                col.className || ""
                                            }`}
                                        >
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
                    <span className="text-xs text-slate-400">
                        Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, data.length)} of {data.length}
                    </span>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`h-9 w-9 rounded-xl text-xs font-semibold transition ${
                                    page === i + 1
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
