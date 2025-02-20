"use client";
import React, { useEffect, useState } from 'react';
import { getTransactionHistory } from '../utils/api';
import { formatEthValue } from '../utils/format';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const walletAddress = localStorage.getItem('wallet_address');
                if (!walletAddress) {
                    throw new Error('Wallet address not found in local storage');
                }
                const data = await getTransactionHistory(walletAddress);
                setTransactions(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Transaction History</h1>
                
                <div className="grid gap-6">
                    {transactions.map((tx, index) => (
                        <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Transaction Hash</p>
                                    <p className="font-mono text-sm">{tx.hash}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    tx.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {tx.status || 'Confirmed'}
                                </span>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">From</p>
                                    <p className="font-mono text-sm truncate">{tx.from}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">To</p>
                                    <p className="font-mono text-sm truncate">{tx.to}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Value</p>
                                    <p className="font-medium text-gray-900">
                                        {formatEthValue(tx.value)} ETH
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="text-gray-900">
                                        {new Date(tx.timeStamp * 1000).toLocaleDateString()} 
                                        {' '}
                                        {new Date(tx.timeStamp * 1000).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;
