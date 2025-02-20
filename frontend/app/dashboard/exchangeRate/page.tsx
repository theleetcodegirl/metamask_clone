'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import contractAddresses from "@/contracts/contract-address.json";
import PaymentGatewayABI from "@/contracts/PaymentGateway.json";

// Contract Address and ABI (replace with your contract's actual address and ABI)
const PAYMENT_GATEWAY_ADDRESS = contractAddresses.PaymentGateway;


// Chainlink Price Feeds
const TOKEN_FEEDS = {
  ETH: '0x694AA1769357215DE4FAC081bf1f309aDC325306', 
  BTC: '0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22', 
};

type Token = keyof typeof TOKEN_FEEDS;

export default function PriceConverter() {
  const [amount, setAmount] = useState('');
  const [fromToken, setFromToken] = useState<Token>('ETH');
  const [toToken, setToToken] = useState<Token>('BTC');
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latestPrice, setLatestPrice] = useState<string | null>(null);

  // Initialize Ethers.js provider and contract instance
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
  const contract = new ethers.Contract(PAYMENT_GATEWAY_ADDRESS, PaymentGatewayABI.abi, provider);
  

  async function fetchPrice(priceFeed: string | ethers.Addressable) {
    try {
      const price = await contract.getLatestPrice(priceFeed);
      return Number(price) / 1e8; // Assuming the price has 8 decimals (Chainlink standard)
    } catch (error) {
        console.log(priceFeed)
        console.error('Error fetching price from contract:', error);
      return 0;
    }
  }

  async function handleConvert() {
    setLoading(true);
    try {
      if (!amount || isNaN(parseFloat(amount))) {
        setConvertedAmount('Invalid amount');
        setLoading(false);
        return;
      }

      const token1Feed = TOKEN_FEEDS[fromToken];
      const token2Feed = TOKEN_FEEDS[toToken];
      console.log("token1",token1Feed)
      
      // Call the contract to convert the amount
      const result = await contract.convertTokenAmount(
        ethers.parseUnits(amount, 18), // Convert amount to 18 decimals
        token1Feed,
        token2Feed
      );

      setConvertedAmount(ethers.formatUnits(result, 18)); // Assuming 18 decimals for result
    } catch (error) {
      console.error('Error converting amount:', error);
      setConvertedAmount('Error');
    }
    setLoading(false);
  }

  useEffect(() => {
    async function updatePrice() {
      const price = await fetchPrice(TOKEN_FEEDS[fromToken]);
      setLatestPrice(price.toString());
      console.log("price",price)
    }
    
    updatePrice();
  }, [fromToken]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Token Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded-lg"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value as Token)}
          >
            {Object.keys(TOKEN_FEEDS).map((token) => (
              <option key={token} value={token}>{token}</option>
            ))}
          </select>
          
          {/* Show the latest price of the selected token */}
          {latestPrice && (
            <div className="text-center text-lg font-semibold mt-2">
              Latest Price of {fromToken}: {latestPrice} USD
            </div>
          )}
          
          <span className="block text-center text-xl">⬇️</span>
          <select
            className="w-full p-2 border rounded-lg"
            value={toToken}
            onChange={(e) => setToToken(e.target.value as Token)}
          >
            {Object.keys(TOKEN_FEEDS).map((token) => (
              <option key={token} value={token}>{token}</option>
            ))}
          </select>
          <Button onClick={handleConvert} disabled={loading} className="w-full">
            {loading ? 'Converting...' : 'Convert'}
          </Button>
          {convertedAmount !== null && (
            <div className="text-center mt-4 text-lg font-bold">
              Converted Amount: {convertedAmount} {toToken}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}