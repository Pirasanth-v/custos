import Dropdown from "@/components/dropdown/Dropdown";
import { ChevronDown } from "lucide-react";

const currencies = [
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "€", code: "EUR", name: "Euro" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  { symbol: "$", code: "CAD", name: "Canadian Dollar" },
  { symbol: "$", code: "AUD", name: "Australian Dollar" },
];

type CurrencyDropdownProps = {
  selectedCurrency: string;
  onSelect: (code: string) => void;
};

export function CurrencyDropdown({
  selectedCurrency,
  onSelect,
}: CurrencyDropdownProps) {
  const current = currencies.find((c) => c.code === selectedCurrency);

  return (
    <Dropdown
      widthClass="w-72"
      trigger={
        <button className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 h-11 text-sm text-foreground hover:bg-accent transition">
          <span>{current?.symbol}</span>
          <span className="font-medium">{current?.code}</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </button>
      }
    >
      <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">
        Base Currency
      </div>

      <div className="p-2">
        {currencies.map((currency) => {
          const active = currency.code === selectedCurrency;

          return (
            <button
              key={currency.code}
              onClick={() => onSelect(currency.code)}
              className={`flex w-full items-center gap-4 rounded-lg px-3 py-2 text-left transition ${
                active ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <span className="w-5 text-sm text-foreground">
                {currency.symbol}
              </span>

              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {currency.code}
                </span>
                <span className="text-muted-foreground">
                  - {currency.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Dropdown>
  );
}