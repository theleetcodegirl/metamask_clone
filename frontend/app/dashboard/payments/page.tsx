"use client";

import { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { WalletContext } from "@/context/WalletProvider"; // Import WalletContext
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

// Import contract data
import contractAddresses from "@/contracts/contract-address.json";
import PaymentGatewayABI from "@/contracts/PaymentGateway.json";
import PaymentReceiptABI from "@/contracts/PaymentReceipt.json";
import PaymentTokenABI from "@/contracts/PaymentToken.json";

export default function Payment() {
  const { connected, account } = useContext(WalletContext); // Use wallet context
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("ETH");
  const [fee, setFee] = useState("0");
  const [receipt, setReceipt] = useState(null);

  // Contract addresses from JSON
  const PAYMENT_GATEWAY_ADDRESS = contractAddresses.PaymentGateway;
  const PAYMENT_RECEIPT_ADDRESS = contractAddresses.PaymentReceipt;
  const PAYMENT_TOKEN_ADDRESS = contractAddresses.PaymentToken;

  const handlePayment = async () => {
    if (!connected || !account) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Contract instances
      const paymentGateway = new ethers.Contract(
        PAYMENT_GATEWAY_ADDRESS,
        PaymentGatewayABI.abi,
        signer
      );
      const paymentReceipt = new ethers.Contract(
        PAYMENT_RECEIPT_ADDRESS,
        PaymentReceiptABI.abi,
        signer
      );
      const paymentToken = new ethers.Contract(
        PAYMENT_TOKEN_ADDRESS,
        PaymentTokenABI.abi,
        signer
      );

      const amountInWei = ethers.parseUnits(amount, 18);

      if (token !== "ETH") {
        // Approve ERC-20 Token
        const allowance = await paymentToken.allowance(
          account,
          PAYMENT_GATEWAY_ADDRESS
        );
        if (allowance < amountInWei) {
          const approveTx = await paymentToken.approve(
            PAYMENT_GATEWAY_ADDRESS,
            amountInWei
          );
          await approveTx.wait();
        }
      }

      // Call payment function (create payment)
      const createTx = await paymentGateway.createPayment(
        recipient,
        amountInWei,
        token === "ETH" ? ethers.ZeroAddress : PAYMENT_TOKEN_ADDRESS,
        { value: token === "ETH" ? amountInWei : 0 }
      );
      const createReceipt = await createTx.wait(); // Wait for the transaction to be mined

      console.log("Payment created:", createReceipt);

      // Call confirm payment after the transaction is mined
      const confirmTx = await paymentGateway.confirmPayment(createReceipt.transactionHash);
      const confirmReceipt = await confirmTx.wait(); // Wait for confirmation

      console.log("Payment confirmed:", confirmReceipt);

      // Mint NFT receipt
      const mintTx = await paymentReceipt.mintReceipt(
        recipient,
        amountInWei,
        token
      );
      await mintTx.wait();

      setReceipt(createReceipt.transactionHash); // Store the transaction hash as the receipt ID
      setStep(3); // Move to the success step
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>
            Send crypto and receive an NFT receipt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Wallet Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Payment Token</Label>
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Transaction Fee: {fee} ETH
              </div>
              <Button type="submit" className="w-full">
                Review Payment
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Confirmation</h3>
              <p>Recipient: {recipient}</p>
              <p>
                Amount: {amount} {token}
              </p>
              <p>Estimated Fee: {fee} ETH</p>
              <Button onClick={handlePayment} className="w-full">
                Pay Now
              </Button>
            </div>
          )}

          {step === 3 && receipt && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p>NFT Receipt ID: {receipt}</p>
              <p>
                Transaction Hash:
                <a
                  href={`https://sepolia.etherscan.io/tx/${receipt}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Etherscan
                </a>
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          {step === 3 && (
            <Button
              onClick={() => {
                setStep(1);
                setReceipt(null);
              }}
              className="w-full"
            >
              Make Another Payment
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}