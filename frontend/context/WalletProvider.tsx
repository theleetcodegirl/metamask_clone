"use client";

import React, { createContext, useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";

export const WalletContext = createContext<{
  connected: boolean;
  account: string | null;
  connectWallet: () => void;
}>({
  connected: false,
  account: null,
  connectWallet: () => {},
});

import { ReactNode } from "react";

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem("walletConnected")) {
        try {
          const provider = new Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          setAccount(account);
          setConnected(true);
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }
    try {
      const provider = new Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      setAccount(account);
      setConnected(true);
      localStorage.setItem("walletConnected", "true");
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <WalletContext.Provider value={{ connected, account, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};