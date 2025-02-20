"use client";
import React, { useEffect, useState } from "react";
import { getBalance } from "../utils/api";

const WalletPage = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    useEffect(() => {
        const storedAddress = localStorage.getItem("wallet_address");
        if (storedAddress) {
            setAddress(storedAddress);
            fetchBalance(storedAddress);
        }
    }, []);

    const fetchBalance = async (address: string) => {
        try {
            const balanceData = await getBalance(address);
            setBalance(balanceData.balance);
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    return (
        <div>
            {address ? (
                <div>
                    <div>
                        <p className="text-sm text-muted-foreground">Connected Address </p>
                        <p>{address}</p>
                    </div>
                    
                    <div className="pt-4">
                        <p className="text-sm text-muted-foreground">Balance </p>
                        <p className="text-2xl font-bold">{balance !== null ? `${balance} ETH` : "Loading..."} </p>
                    </div>
                </div>
            ) : (
                <p>No wallet address found in local storage.</p>
            )}
        </div>
    );
};

export default WalletPage;