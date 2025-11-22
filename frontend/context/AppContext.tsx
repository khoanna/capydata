"use client";

import React, {createContext, useContext, useEffect, useState} from "react";
import type {Asset} from "@/type/Item";
import useMarketplace from "@/hooks/useMarketplace";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface AppContext {
  allListings: Asset[] | undefined;
  appLoading: boolean;
  userDatasets: string[] | undefined;
  fetchListings: () => Promise<void>;
  fetchUserDatasets: () => Promise<void>;
}

const appContext = createContext<AppContext | undefined>(undefined);

export const AppContextProvider = ({children}: {children: React.ReactNode}) => {
  const [allListings, setAllListings] = useState<Asset[] | undefined>(undefined);
  const [userDatasets, setUserDatasets] = useState<string[] | undefined>(undefined);
  const [appLoading, setAppLoading] = useState(false);
  const {getAllListings, getUserDatasets} = useMarketplace();
  const currentAccount = useCurrentAccount();

  const fetchListings = async () => {
    setAppLoading(true);
    const listings = await getAllListings();
    setAllListings(listings);
    
    if (currentAccount?.address) {
      await getUserDatasets();
    }
    
    setAppLoading(false);
  };

  const fetchUserDatasets = async () => {
    if (currentAccount?.address) {
      const datasets = await getUserDatasets();
      setUserDatasets(datasets);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);
  
  useEffect(() => {
    fetchUserDatasets();
  }, [currentAccount?.address]);

  const userState = {
    allListings,
    appLoading,
    userDatasets,
    fetchListings,
    fetchUserDatasets
  };

  return (
    <appContext.Provider value={userState}>{children}</appContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
