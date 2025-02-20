"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "../utils/api";

export default function LoginPage() {
    const [loginData, setLoginData] = useState({ address: "", password: "" });
    const [token, setToken] = useState("");
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleLogin = async () => {
        const res = await login(loginData.address, loginData.password);
        if (res.access_token) { 
            setToken(res.access_token);
            localStorage.setItem("access_token", res.access_token);
            localStorage.setItem("wallet_address", loginData.address);
            router.push("/dashboard");
        } else {
            alert(res.error || "Login failed!");
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <Image
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80"
                    alt="Crypto background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
                    <div className="p-12 text-white">
                        <h2 className="text-4xl font-bold">Welcome to MetaMask Clone</h2>
                        <p className="mt-4 text-lg">Secure and easy way to manage your crypto assets</p>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-center text-gray-900">
                            Sign in to your account
                        </h1>
                        <p className="mt-2 text-center text-gray-600">
                            Enter your credentials to access your wallet
                        </p>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Wallet Address
                                </label>
                                <input
                                    type="text"
                                    value={loginData.address}
                                    onChange={(e) => setLoginData({ ...loginData, address: e.target.value })}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    placeholder="Enter your wallet address"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
