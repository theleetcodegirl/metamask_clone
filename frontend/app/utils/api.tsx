import axios from "axios";

const API_BASE_URL = "https://studious-space-acorn-jj7995wr59xqhj57q-8000.app.github.dev/api";

export const createWallet = async () => {
    const response = await axios.post(`${API_BASE_URL}/create_wallet/`);
    return response.data;
};

export const getWallets = async () => {
    const response = await axios.get(`${API_BASE_URL}/wallets/`);
    return response.data;
};