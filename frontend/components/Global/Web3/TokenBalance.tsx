"use client";
import { Wallet } from "lucide-react";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { formatSUI } from "@/lib/sui";
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

  if (!account || !balance) return null;

  const suiBalance = formatSUI(BigInt(balance.totalBalance));

  return (
    <div className="hidden lg:flex items-center gap-2">
      {/* SUI Balance */}
      <Badge variant="chain" size="md">
        <Wallet className="w-3 h-3" />
        {suiBalance} SUI
      </Badge>
    </div>
  );
}

export default TokenBalance;
