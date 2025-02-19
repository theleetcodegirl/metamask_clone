import axios from "axios";

const API_BASE_URL = "https://animated-memory-g4r66qwxq6vq3wjrq-8000.app.github.dev/api";

export const createWallet = async (password: string) => {
    const res = await fetch(`${API_BASE_URL}/create_wallet/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });
    return res.json();
};

export const login = async (address: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
    });
    return res.json();
};

export const getWallets = async () => {
    const response = await axios.get(`${API_BASE_URL}/wallets/`);
    return response.data;
};

export const getBalance = async (address: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/check_balance/${address}/`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching balance:", error);
        throw error;
    }
};