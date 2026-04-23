export interface MonthlySummary {
    month: string;
    total_income: string;
    total_expense: string;
  }
   
  export interface CategoryBreakdown {
    category_id: string | null;
    category_name: string | null;
    total: string;
    tx_count: number;
  }
   
  export interface RecentTransaction {
    id: string;
    type: "income" | "expense" | "transfer";
    amount: string;
    description: string | null;
    transaction_date: string;
    status: "pending" | "posted" | "voided";
    category_name?: string | null;
  }
   
  export interface DashboardResponse {
    net_balance: string;
    pending_count: number;
    current_month: {
      income: string;
      expense: string;
    };
    monthly: MonthlySummary[];
    categories: CategoryBreakdown[];
    recent: RecentTransaction[];
  }