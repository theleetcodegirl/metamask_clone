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

export const getPrivateKey = async (address: string, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/get_private_key/${address}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "password" : password }),
        });
        
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        
        return response.json();
    } catch (error) {
        console.error("Error fetching private key:", error);
        throw error;
    }
};

export const sendTransaction = async (from_address: string, to_address: string, amount: number, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/send_transaction/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_address,
                to_address,
                amount: amount.toString(), // Convert to string to preserve precision
                password
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Transaction failed");
        }

        return data;
    } catch (error: any) {
        console.error("Error sending transaction:", error);
        throw new Error(error.message || "Failed to send transaction");
    }
};

export const getTransactionHistory = async (address:string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/get_transactions/${address}/`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        throw error;
    }
};