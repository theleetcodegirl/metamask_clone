'use client'
import { useState, useEffect } from 'react';
import { getPrivateKey } from '../utils/api';

export default function PrivateKeyPage() {
    const [password, setPassword] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
        const storedAddress = localStorage.getItem('wallet_address');
        if (!storedAddress) {
            setError('No wallet address found');
            return;
        }
        setAddress(storedAddress);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) {
            setError('Address not found in localStorage');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await getPrivateKey(address, password);
            setPrivateKey(response.private_key);
        } catch (err) {
            setError('Failed to get private key. Please check your password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Get Private Key</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Loading...' : 'Show Private Key'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                {privateKey && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">Your Private Key:</h2>
                        <div className="bg-gray-100 p-4 rounded break-all text-sm">
                            {privateKey}
                        </div>
                        <p className="text-red-600 text-sm mt-2">
                            Warning: Never share your private key with anyone!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
