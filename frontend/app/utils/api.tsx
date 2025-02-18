// import axios from "axios";

// const API_BASE_URL = "https://studious-space-acorn-jj7995wr59xqhj57q-8000.app.github.dev/api";

// // export const createWallet = async () => {
// //     const response = await axios.post(`${API_BASE_URL}/create_wallet/`);
// //     return response.data;
// // };

// export const createWallet = async (password: string) => {
//     const res = await fetch("/api/create_wallet/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ password })
//     });
//     return res.json();
// };

// export const login = async (address: string, password: string) => {
//     const res = await fetch("/api/login/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ address, password })
//     });
//     return res.json();
// };

// export const getWallets = async () => {
//     const response = await axios.get(`${API_BASE_URL}/wallets/`);
//     return response.data;
// };

import axios from "axios";

const API_BASE_URL = "https://studious-space-acorn-jj7995wr59xqhj57q-8000.app.github.dev/api";

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