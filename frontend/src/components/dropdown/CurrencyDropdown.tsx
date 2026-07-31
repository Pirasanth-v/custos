import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm text-foreground transition hover:bg-accent"
        >
          <>
            <span>{current?.symbol}</span>

            <span className="font-medium">
              {current?.code}
            </span>
          </>
          <ChevronDown
            size={16}
            className="ml-auto shrink-0 text-muted-foreground"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-72 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-sm font-medium text-foreground">
          Base Currency
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {currencies.map((currency) => {
          const active = currency.code === selectedCurrency;

          return (
            <DropdownMenuItem
              key={currency.code}
              onSelect={() => onSelect(currency.code)}
              className={`flex cursor-pointer items-center gap-4 rounded-lg px-3 py-2 ${active ? "bg-accent" : ""
                }`}
            >
              <span className="w-5 shrink-0 text-sm text-foreground">
                {currency.symbol}
              </span>

              <div className="flex min-w-0 items-center gap-2">
                <span className="font-medium text-foreground">
                  {currency.code}
                </span>

                <span className="truncate text-muted-foreground">
                  - {currency.name}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}