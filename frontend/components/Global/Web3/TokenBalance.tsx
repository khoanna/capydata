"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { formatSUI, CAPY_TOKEN } from "@/lib/sui";
import Badge from "@/components/Common/Badge";

export function TokenBalance() {
  const account = useCurrentAccount();

  // Get SUI balance
  const { data: balance } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address || "",
    },
    {
      enabled: !!account,
    }
  );

  // Mock CAPY balance (in a real app, you'd query the actual CAPY token balance)
  const mockCapyBalance = 1234.56;

  if (!account || !balance) return null;

  const suiBalance = formatSUI(BigInt(balance.totalBalance));

  return (
    <div className="hidden lg:flex items-center gap-2">
      {/* SUI Balance */}
      <Badge variant="chain" size="md">
        <i data-lucide="wallet" className="w-3 h-3"></i>
        {suiBalance} SUI
      </Badge>

      {/* CAPY Balance */}
      <Badge variant="price" size="md">
        <i data-lucide="coins" className="w-3 h-3"></i>
        {mockCapyBalance.toFixed(2)} CAPY
      </Badge>
    </div>
  );
}

export default TokenBalance;
