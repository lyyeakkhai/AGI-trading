"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  compact?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, compact = false, className = "", ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-lg border border-border-color bg-surface">
        <table
          ref={ref}
          className={`w-full text-left border-collapse ${compact ? "text-xs" : "text-sm"} ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className = "", ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={`border-b border-border-color bg-bg-900/80 text-[11px] uppercase tracking-wider text-gray-400 font-semibold select-none ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
});
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className = "", ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={`divide-y divide-border-color/60 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
});
TableBody.displayName = "TableBody";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  interactive?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, selected = false, interactive = true, className = "", ...props }, ref) => {
    const stateStyles = selected
      ? "bg-cyan-dim/20 border-l-2 border-l-cyan-500"
      : interactive
      ? "hover:bg-surface-hover transition-colors"
      : "";

    return (
      <tr
        ref={ref}
        className={`${stateStyles} ${className}`}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, align = "left", className = "", ...props }, ref) => {
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align];

    return (
      <th
        ref={ref}
        className={`px-3 py-2.5 font-medium ${alignClass} ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  mono?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, align = "left", mono = false, className = "", ...props }, ref) => {
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align];

    return (
      <td
        ref={ref}
        className={`px-3 py-2.5 text-gray-300 ${mono ? "font-mono tracking-tight" : ""} ${alignClass} ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";

export function TableEmpty({
  message = "No data available",
  colSpan = 5,
}: {
  message?: string;
  colSpan?: number;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-8 text-center text-xs text-gray-500 font-mono"
      >
        {message}
      </td>
    </tr>
  );
}

export function TableLoading({
  colSpan = 5,
}: {
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
          <span>LOADING STREAM...</span>
        </div>
      </td>
    </tr>
  );
}
