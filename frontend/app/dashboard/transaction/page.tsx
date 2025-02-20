"use client";

import { useState, useEffect } from "react";

export default function TransactionPage() {
  interface Transaction {
    recipient: string;
    amount: number;
    token: string;

    date: string;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedTransactions = JSON.parse(
      localStorage.getItem("transactions") || "[]"
    );
    setTransactions(savedTransactions);
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="border p-4 rounded-md">
              <p>
                <strong>Recipient:</strong> {tx.recipient}
              </p>
              <p>
                <strong>Amount:</strong> {tx.amount} {tx.token}
              </p>
              <p>
                <strong>Date:</strong> {tx.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}