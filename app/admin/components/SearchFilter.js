"use client";
import { Search, ChevronDown } from "lucide-react";

export default function SearchFilter({
    searchValue,
    onSearchChange,
    filterOptions,
    filterValue,
    onFilterChange,
    searchPlaceholder = "Search...",
}) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 basis-[280px]">
                <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
            </div>

            {filterOptions && (
                <div className="relative">
                    <select
                        value={filterValue}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="h-11 min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                        {filterOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
            )}
        </div>
    );
}
