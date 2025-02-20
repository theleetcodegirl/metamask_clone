"use client";
import { useState } from "react";
import { createWallet } from "../utils/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SignupPage() {
    const [wallet, setWallet] = useState<{ address: string; seed_phrase: string } | null>(null);
    const [password, setPassword] = useState("");

    const router = useRouter();

    const onClickLogin = () => {
        router.push('/login');
    };

    const handleCreateWallet = async () => {
        const newWallet = await createWallet(password);
        setWallet(newWallet);
    };

    return (
        <div className="min-h-screen relative">
            {/* Background image */}
            <Image
                src="https://images.unsplash.com/photo-1645729141998-fb8c5645ca4d?q=80&w=2070"
                alt="Crypto background"
                fill
                className="object-cover"
                priority
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
                <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-center mb-8">
                        <Image
                            src="https://images.unsplash.com/photo-1644395703886-3fa4a2e7c3e4?q=80&w=200"
                            alt="Wallet icon"
                            width={60}
                            height={60}
                            className="rounded-full"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        Create Your Wallet
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Set Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        <button 
                            onClick={handleCreateWallet} 
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                        >
                            Create Wallet
                        </button>

                        {wallet && (
                            <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    🎉 Wallet Created Successfully
                                </h3>
                                <div className="space-y-3">
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-600">Address</span>
                                        <span className="font-mono text-sm break-all">{wallet.address}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-600">Seed Phrase</span>
                                        <span className="font-mono text-sm break-all bg-yellow-50 p-2 rounded-md border border-yellow-100">
                                            {wallet.seed_phrase}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <Button 
                            onClick={onClickLogin} 
                            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg transition-colors font-medium"
                        >
                            Already have a wallet? Login
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
