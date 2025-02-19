"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
            localStorage.setItem("wallet_address", loginData.address); // Save address to localStorage
            router.push("/wallet"); // Redirect to /wallet after successful login
        } else {
            alert(res.error || "Login failed!");
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold">Login</h1>
            <input
                type="text"
                placeholder="Wallet Address"
                value={loginData.address}
                onChange={(e) => setLoginData({ ...loginData, address: e.target.value })}
                className="p-2 border rounded mt-2"
            />
            <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="p-2 border rounded mt-2"
            />
            <button onClick={handleLogin} className="mt-2 p-2 bg-green-500 text-white rounded">
                Login
            </button>

            {token && <p className="mt-4">JWT Token: {token}</p>}
        </div>
    );
}