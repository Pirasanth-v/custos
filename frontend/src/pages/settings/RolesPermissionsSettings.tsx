import Table from "@/components/Table";

const colorCell = (value: string) => {
  if (value === "✓") {
    return (
      <span className="text-success text-lg font-bold flex justify-center items-center">
        {value}
      </span>
    );
  }
  if (value === "✘") {
    return (
      <span className="text-muted-foreground/30 text-lg flex justify-center items-center">
        {value}
      </span>
    );
  }
  return <span>{value}</span>;
};

type PermissionRow = {
  feature: string;
  owner: string;
  admin: string;
  member: string;
  viewer: string;
};

const RolesPermissionsSettings = () => {
  // Define your roles data here
  const headers = [
    "Feature",
    <span className="flex justify-center">Owner</span>,
    <span className="flex justify-center">Admin</span>,
    <span className="flex justify-center">Member</span>,
    <span className="flex justify-center">Viewer</span>
  ];

  // Data for each role and their permissions
  const data = [
    { feature: "Add transactions", owner: "✓", admin: "✓", member: "✓", viewer: "✘" },
    { feature: "Upload files", owner: "✓", admin: "✓", member: "✓", viewer: "✘" },
    { feature: "View reports", owner: "✓", admin: "✓", member: "✓", viewer: "✓" },
    { feature: "Manage budgets", owner: "✓", admin: "✓", member: "✘", viewer: "✘" },
    { feature: "Invite members", owner: "✓", admin: "✓", member: "✘", viewer: "✘" },
    { feature: "Export data", owner: "✓", admin: "✓", member: "✓", viewer: "✘" },
  ];

  // Function to render each row for the table
  const renderRow = (row: {
    feature: string;
    owner: string;
    admin: string;
    member: string;
    viewer: string;
  }) => (
    <>
      <td className="px-4 py-3">{row.feature}</td>
      <td className="px-4 py-3 text-center">{colorCell(row.owner)}</td>
      <td className="px-4 py-3 text-center">{colorCell(row.admin)}</td>
      <td className="px-4 py-3 text-center">{colorCell(row.member)}</td>
      <td className="px-4 py-3 text-center">{colorCell(row.viewer)}</td>
    </>
  );

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Roles & Permissions</h1>

      {/* Roles Table */}
      <Table<PermissionRow>
        headers={headers}
        data={data}
        renderRow={renderRow}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  );
};

export default RolesPermissionsSettings;