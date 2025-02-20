"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import contractAddresses from "@/contracts/contract-address.json";
import PaymentGatewayABI from "@/contracts/PaymentGateway.json";
import { WalletContext } from "@/context/WalletProvider";
import { ethers } from "ethers";

export default function GetTokenPage() {
  const { connected, account } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [tokensNeeded, setTokensNeeded] = useState(1);
  const [walletAddress, setWalletAddress] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isZeroTokenDialog, setIsZeroTokenDialog] = useState(false);

  const PAYMENT_GATEWAY_ADDRESS = contractAddresses.PaymentGateway;
  const USD_TOKEN_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT (Ethereum Mainnet)
  
  // Fixed token price
  const TOKEN_PRICE_IN_USD = 5; // Adjust if needed
  const TOKEN_PRICE_IN_ETH = 0.002; // Adjust if needed

  // Calculate total cost
  const totalUSD = tokensNeeded * TOKEN_PRICE_IN_USD;
  const totalETH = tokensNeeded * TOKEN_PRICE_IN_ETH;

  const buyToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    if (tokensNeeded <= 0) {
      setIsZeroTokenDialog(true);
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const paymentGateway = new ethers.Contract(
        PAYMENT_GATEWAY_ADDRESS,
        PaymentGatewayABI.abi,
        signer
      );

      const usdToken = new ethers.Contract(
        USD_TOKEN_ADDRESS,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        signer
      );

      const usdAmountInWei = ethers.parseUnits(totalUSD.toString(), 18);

      // Approve spending
      const approveTx = await usdToken.approve(PAYMENT_GATEWAY_ADDRESS, usdAmountInWei);
      await approveTx.wait();
      console.log("Approval successful");

      // Call buyPAYWithUSD
      const tx = await paymentGateway.buyPAYWithUSD(USD_TOKEN_ADDRESS, usdAmountInWei);
      await tx.wait();

      alert("Token purchase successful!");
    } catch (error) {
      console.error(error);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={buyToken}
        className="p-8 border rounded-md shadow-lg bg-white w-96"
      >
        <h2 className="text-2xl font-bold mb-6">Request Tokens</h2>

        <div className="mb-4">
          <label
            htmlFor="walletAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Wallet Address
          </label>
          <input
            type="text"
            id="walletAddress"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            required
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter your wallet address"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="tokensNeeded"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Tokens Needed
          </label>
          <input
            type="number"
            id="tokensNeeded"
            value={tokensNeeded}
            onChange={(e) => setTokensNeeded(Number(e.target.value))}
            min="1"
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter the number of tokens"
          />
        </div>

        {/* <div className="mb-6">
          <p className="text-sm text-gray-700">1 Token = {TOKEN_PRICE_IN_USD} USD</p>
          <p className="text-sm text-gray-700">1 Token = {TOKEN_PRICE_IN_ETH} ETH (Approx.)</p>
          <p className="text-sm text-gray-700">
            Total: {totalUSD} USD | {totalETH} ETH
          </p>
        </div> */}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing..." : "Request Token"}
        </Button>
      </form>

      {/* Dialog for 0 tokens */}
      <Dialog open={isZeroTokenDialog} onOpenChange={() => setIsZeroTokenDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invalid Token Amount</DialogTitle>
          </DialogHeader>
          <p className="mb-4">You cannot request 0 tokens. Please enter a valid amount.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsZeroTokenDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for valid token request */}
      <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token Request Confirmation</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            You are about to request {tokensNeeded} token(s), which will be deducted from your MetaMask account.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => alert("Token request submitted successfully!")}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}