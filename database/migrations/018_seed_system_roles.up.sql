INSERT INTO roles (id, name, permissions) VALUES
('11111111-1111-1111-1111-111111111111', 'Owner', '["all"]'),
('22222222-2222-2222-2222-222222222222', 'Admin', '["edit_org", "manage_members", "manage_accounts", "manage_categories", "create_transactions", "edit_transactions", "delete_transactions",  "approve_transactions"]'),
('33333333-3333-3333-3333-333333333333', 'Member', '["create_transactions", "edit_transactions", "view_transactions"]'),
('44444444-4444-4444-4444-444444444444', 'Viewer', '["view_transactions"]');