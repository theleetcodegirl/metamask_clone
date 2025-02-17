"use client";
import { useState } from "react";
import { createWallet, getWallets } from "../utils/api";

export default function WalletPage() {
    const [wallet, setWallet] = useState<{ address: string; private_key: string } | null>(null);
    const [wallets, setWallets] = useState<{ address: string; created_at: string }[]>([]);

    const handleCreateWallet = async () => {
        const newWallet = await createWallet();
        setWallet(newWallet);
    };

    const handleGetWallets = async () => {
        const allWallets = await getWallets();
        setWallets(allWallets);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold">Decentralized Wallets</h1>
            
            <button onClick={handleCreateWallet} className="mt-4 p-2 bg-blue-500 text-white rounded">
                Create Wallet
            </button>

            {wallet && (
                <div className="mt-4 p-4 border rounded">
                    <h2>New Wallet</h2>
                    <p><strong>Address:</strong> {wallet.address}</p>
                    <p><strong>Private Key:</strong> {wallet.private_key}</p>
                </div>
            )}

            <button onClick={handleGetWallets} className="mt-4 p-2 bg-green-500 text-white rounded">
                Fetch Wallets
            </button>

            <ul className="mt-4">
                {wallets.map((w) => (
                    <li key={w.address} className="p-2 border-b">{w.address} (Created: {new Date(w.created_at).toLocaleString()})</li>
                ))}
            </ul>
        </div>
    );
}
