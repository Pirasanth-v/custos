type TableProps<T> = {
  headers: (string | React.ReactNode)[];
  data: T[];
  renderRow: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
};

const Table = <T,>({ headers, data, renderRow, onRowClick }: TableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-sm text-left text-muted-foreground bg-card rounded-xl overflow-hidden">
        <thead className="bg-card text-xs uppercase text-muted-foreground">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 font-semibold tracking-wide">
                {header}
              </th>
            ))}
          </tr>
        </thead>
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
