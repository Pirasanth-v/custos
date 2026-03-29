import React from "react";

// Type for a generic table row data
type TableRow = Record<string, unknown>;

// Define the structure for TableProps
type TableProps = {
  headers: string[]; // Array of headers (column names)
  data: TableRow[]; // Array of data for rows
  renderRow: (row: TableRow) => React.ReactNode; // Function to render each row
  onRowClick?: (row: TableRow) => void; // Optional row click handler
};

const Table: React.FC<TableProps> = ({
  headers,
  data,
  renderRow,
  onRowClick,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-sm text-left text-muted-foreground bg-card rounded-xl overflow-hidden">
        {/* Table Header */}
        <thead className="bg-card text-xs uppercase text-muted-foreground">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 font-semibold tracking-wide">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="text-sm">
          {(Array.isArray(data) ? data : []).map((row, index) => (
            <tr
              key={index}
              className="hover:bg-card/90 transition border-0 border-b border-border last:border-b-0"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
