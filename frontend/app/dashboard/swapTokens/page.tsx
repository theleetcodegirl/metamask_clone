"use client";

import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import contractAddresses from "@/contracts/contract-address.json";
import PaymentGatewayABI from "@/contracts/PaymentGateway.json";
import PaymentTokenABI from "@/contracts/PaymentToken.json";
import { WalletContext } from "@/context/WalletProvider";
// import { IUniswapV2Router02 } from '@uniswap/v2-periphery';

const PAYMENT_GATEWAY_ADDRESS = contractAddresses.PaymentGateway;
const PAYMENT_TOKEN_ADDRESS = contractAddresses.PaymentToken;
const UNISWAP_ROUTER_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Replace with your Uniswap router address
const TOKEN_ADDRESSES: { [key: string]: string } = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  STC: PAYMENT_TOKEN_ADDRESS, // Replace with real STC address
};

const SwapComponent = () => {
  const { connected, account } = useContext(WalletContext); // Use wallet context
  const [amountIn, setAmountIn] = useState("");
  const [tokenIn, setTokenIn] = useState<keyof typeof TOKEN_ADDRESSES>("USDT");
  const [tokenOut, setTokenOut] = useState<keyof typeof TOKEN_ADDRESSES>("STC");
  const [swappedAmount, setSwappedAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(0);  

  // const getExchangeRate = async () => {
  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const signer = await provider.getSigner();
  
  //     console.log('Provider and signer initialized');
  
  //     const contract = new ethers.Contract(
  //       UNISWAP_ROUTER_ADDRESS, // Uniswap Router Address
  //       ["function getReserves(address, address) public view returns (uint256, uint256)"], // ABI method
  //       signer
  //     );
  
  //     console.log('Contract initialized:', contract);
  
  //     // Get reserves for the token pair (USDT and STC)
  //     const [reserveIn, reserveOut] = await contract.getReserves(
  //       TOKEN_ADDRESSES[tokenIn], // USDT Address
  //       TOKEN_ADDRESSES[tokenOut]  // STC Address
  //     );
  
  //     console.log('Reserves:', reserveIn, reserveOut);
  
  //     // Calculate the exchange rate
  //     const exchangeRate = parseFloat(ethers.formatUnits(reserveOut, 18)) / parseFloat(ethers.formatUnits(reserveIn, 18)); // 18 decimals for ERC-20 tokens
  //     return exchangeRate;
  //   } catch (error) {
  //     console.error("Error getting exchange rate:", error);
  //     return 0;
  //   }
  // };

  // const convertTokenAmount = async (amountIn: string) => {
  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const signer = await provider.getSigner();

  //     const contract = new ethers.Contract(
  //       PAYMENT_GATEWAY_ADDRESS,
  //       PaymentGatewayABI.abi,
  //       signer
  //     );

  //     // Fetching price feed addresses for both tokens (adjust as necessary)
  //     const tokenInFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Replace with real price feed address for tokenIn
  //     const tokenOutFeed = "0xABCDEF1234567890ABCDEF1234567890ABCDEF12"; // Replace with real price feed address for tokenOut

  //     // Convert the amount using the contract's method
  //     const convertedAmountWei = await contract.convertTokenAmount(
  //       ethers.parseUnits(amountIn, 18), // Convert amountIn to wei
  //       tokenInFeed,
  //       tokenOutFeed
  //     );

  //     const convertedAmount = ethers.formatUnits(convertedAmountWei, 18); // Convert back to the correct unit
  //     setConvertedAmount(convertedAmount); // Set the converted amount to state
  //   } catch (error) {
  //     console.error("Error converting token amount:", error);
  //     setConvertedAmount(null);
  //   }
  // };

  // useEffect(() => {
  //   const fetchExchangeRate = async () => {
  //     const rate = await getExchangeRate();
  //     setExchangeRate(rate);
  //   };
  
  //   fetchExchangeRate();
  // }, [tokenIn, tokenOut]);

  // useEffect(() => {
  //   if (amountIn) {
  //     convertTokenAmount(amountIn); // Convert when amountIn changes
  //   }
  // }, [amountIn, tokenIn, tokenOut]);


  const getExchangeRate = () => {
    if (tokenIn === "STC" && tokenOut === "USDT") {
      return 0.15; // 1 STC = 0.15 USDT
    } else if (tokenIn === "USDT" && tokenOut === "STC") {
      return 1 / 0.15; // 1 USDT = 6.67 STC
    }
    return 1;
  };

  // Convert amount based on exchange rate
  const convertTokenAmount = (amount: string) => {
    const rate = getExchangeRate();
    setConvertedAmount((parseFloat(amount) * rate).toFixed(4));
  };

  useEffect(() => {
    setExchangeRate(getExchangeRate());
  }, [tokenIn, tokenOut]);

  useEffect(() => {
    if (amountIn) {
      convertTokenAmount(amountIn);
    }
  }, [amountIn, tokenIn, tokenOut]);
  
  // Approve Spending
  const approveToken = async () => {
    if (!account) return alert("Connect wallet first.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenContract = new ethers.Contract(
      TOKEN_ADDRESSES[tokenIn],
      PaymentTokenABI.abi,
      signer
    );

    const amountToApprove = ethers.parseUnits(amountIn, 18);
    try {
      const tx = await tokenContract.approve(
        PAYMENT_GATEWAY_ADDRESS,
        amountToApprove
      );
      await tx.wait();
      alert("Approval successful!");
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed!");
    }
  };

  // Swap Tokens
  const swapTokens = async () => {
    if (!account) return alert("Connect wallet first.");
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        PAYMENT_GATEWAY_ADDRESS,
        PaymentGatewayABI.abi,
        signer
      );

      const amountInWei = ethers.parseUnits(amountIn, 18);
      const tx = await contract.swapTokens(
        TOKEN_ADDRESSES[tokenIn],
        TOKEN_ADDRESSES[tokenOut],
        amountInWei,
        "0x694AA1769357215DE4FAC081bf1f309aDC325306", // USDT Chainlink Price Feed
        "0xABCDEF1234567890ABCDEF1234567890ABCDEF12", // STC Chainlink Price Feed
        account
      );

      await tx.wait();
      setSwappedAmount(amountIn); // Set the swapped amount to the input amount
      alert("Swap successful!");
    } catch (error) {
      console.error("Swap failed:", error);
      alert("Swap failed!");
    }
    setLoading(false);
  };

  return (
    <div className=" justify-center items-center p-4">
      <div className="p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Swap Tokens</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium">Token In:</label>
          <select
            className="border p-2 rounded w-full"
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value)}
          >
            <option value="USDT">USDT</option>
            <option value="STC">STC</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Token Out:</label>
          <select
            className="border p-2 rounded w-full"
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value)}
          >
            <option value="STC">STC</option>
            <option value="USDT">USDT</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Amount:</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="mb-4 text-sm text-gray-600">
          1 {tokenIn} = {exchangeRate.toFixed(4)} {tokenOut}
        </div>

        {convertedAmount && (
          <div className="mb-4 text-sm text-gray-600">
            Converted Amount: {convertedAmount} {tokenOut}
          </div>
        )}

        <button
          onClick={approveToken}
          className="bg-yellow-500 text-white px-4 py-2 rounded w-full mb-2"
        >
          Approve Token
        </button>

        <button
          onClick={swapTokens}
          className={`bg-green-500 text-white px-4 py-2 rounded w-full ${
            loading ? "opacity-50" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Swapping..." : "Swap"}
        </button>
        {swappedAmount && (
          <div className="mt-4 text-green-500">
            <p>
              You swapped: {swappedAmount} {tokenIn} for {tokenOut}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapComponent;