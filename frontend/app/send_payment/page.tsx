'use client';
import { useState, useEffect } from 'react';
import { sendTransaction } from '../utils/api'; // Import the sendTransaction function

export default function SendPayment() {
  const [formData, setFormData] = useState({
    from_address: '',
    to_address: '',
    amount: '',
    password: '', // Add password field
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: string; error?: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem('wallet_address');
    if (storedAddress) {
      setFormData(prev => ({
        ...prev,
        from_address: storedAddress
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isProcessing || loading) {
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setResult({});

    try {
      const response = await sendTransaction(
        formData.from_address,
        formData.to_address,
        Number(formData.amount), // Ensure proper number conversion
        formData.password
      );
      
      if (response.tx_hash) {
        setResult({ success: `Transaction sent successfully! Hash: ${response.tx_hash}` });
        // Clear form only after successful transaction
        setFormData(prev => ({
          ...prev,
          to_address: '',
          amount: '',
          password: ''
        }));
      } else {
        throw new Error('No transaction hash received');
      }
    } catch (error: any) {
      setResult({ error: error.message || 'Failed to send transaction' });
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Send ETH</h1>
      
      <img 
        src="https://source.unsplash.com/random/800x200?crypto" 
        alt="Crypto" 
        className="w-full h-48 object-cover rounded mb-6"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">From Address</label>
          <input
            type="text"
            value={formData.from_address}
            className="w-full p-2 border rounded bg-gray-100"
            readOnly
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">To Address</label>
          <input
            type="text"
            value={formData.to_address}
            onChange={(e) => setFormData({...formData, to_address: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Amount (ETH)</label>
          <input
            type="number"
            step="0.000000000000000001" // Allow for very small amounts
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || isProcessing}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Processing Transaction...' : 'Send ETH'}
        </button>
      </form>

      {result.success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          {result.success}
        </div>
      )}

      {result.error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {result.error}
        </div>
      )}
    </div>
  );
}
