export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency_id: string;
  currency_code: string
  currency_name: string;
  currency_symbol: string;
  initial_balance: string;
  net_balance: string;
  description?: string;
  created_by: string;
  created_at: string;  
  updated_at: string; 
}

export type CreateAccount = {
  name: string;
  type: AccountType;
  currency_id: string;
  initial_balance: string;
  description?: string;
}

export type UpdateAccountRequest = {
  name?: string;
  description?: string;
}

export type AccountType =   
| "cash"
| "bank"
| "credit"
| "savings"
| "wallet"
| "other";