import React, { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type PaginationState,
} from "@tanstack/react-table";
import { fetchSubmissions } from "../api";
import { Loader2, ArrowUpDown, Eye } from "lucide-react";
import type { Submission, SubmissionData } from "../types";

const columnHelper = createColumnHelper<Submission>();

export default function SubmissionsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["submissions", pagination, sortOrder],
    queryFn: () =>
      fetchSubmissions(
        pagination.pageIndex + 1,
        pagination.pageSize,
        sortOrder
      ),
    placeholderData: keepPreviousData,
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="font-mono text-xs text-slate-500">
          {info.getValue().slice(0, 8)}...
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: () => (
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="flex items-center gap-1 font-bold hover:bg-slate-100 p-1 rounded"
        >
          Created At <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <button
          onClick={() => setSelectedSubmission(info.row.original)}
          className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-4 h-4" /> View
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    // Safely access totalPages. If data is undefined, default to -1
    pageCount: data?.meta?.totalPages ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-fit">
      <h2 className="text-xl font-bold mb-4">Submissions History</h2>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 uppercase">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th key={h.id} className="px-4 py-3 font-semibold">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="border rounded p-1 text-sm"
              >
                {[10, 20, 50].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-600">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-slate-50"
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Simple View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-2 right-2 text-xl font-bold cursor-pointer"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4">Submission Details</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {Object.entries(selectedSubmission.data).map(([key, val]) => {
                const value = val as SubmissionData[keyof SubmissionData];

                return (
                  <div key={key} className="grid grid-cols-3 border-b py-2">
                    <span className="font-semibold text-slate-600 capitalize">
                      {key}
                    </span>
                    <span className="col-span-2 text-slate-900 wrap-break-words">
                      {Array.isArray(value) ? value.join(", ") : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
