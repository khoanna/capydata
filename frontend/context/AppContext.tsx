"use client";

import React, {createContext, useContext, useEffect, useState} from "react";
import type {Asset} from "@/type/Item";
import useMarketplace from "@/hooks/useMarketplace";

interface AppContext {
  allListings: Asset[] | undefined;
  appLoading: boolean;
}

const appContext = createContext<AppContext | undefined>(undefined);

export const AppContextProvider = ({children}: {children: React.ReactNode}) => {
  const [allListings, setAllListings] = useState<Asset[] | undefined>(undefined);
  const [appLoading, setAppLoading] = useState(false);
  const {getAllListings} = useMarketplace();

  const fetchListings = async () => {
    setAppLoading(true);
    const listings = await getAllListings();
    setAllListings(listings);
    setAppLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const userState = {
    allListings,
    appLoading,
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
