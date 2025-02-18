"use client";
import { useState } from "react";
import { createWallet } from "../utils/api";

export default function SignupPage() {
    const [wallet, setWallet] = useState<{ address: string; seed_phrase: string } | null>(null);
    const [password, setPassword] = useState("");

    const handleCreateWallet = async () => {
        const newWallet = await createWallet(password);
        setWallet(newWallet);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold">Create Wallet</h1>
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded mt-2"
            />
            <button onClick={handleCreateWallet} className="mt-2 p-2 bg-blue-500 text-white rounded">
                Create
            </button>

            {wallet && (
                <div className="mt-4 p-4 border rounded">
                    <h3>Wallet Created</h3>
                    <p><strong>Address:</strong> {wallet.address}</p>
                    <p><strong>Seed Phrase:</strong> {wallet.seed_phrase}</p>
                </div>
            )}
        </div>
    );
}