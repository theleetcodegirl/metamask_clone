"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, Send, FileText, RefreshCcw, ExternalLink } from "lucide-react";
import { ethers } from "ethers";
import WalletPage from "../wallet/page";

// Dummy data for recent transactions
const recentTransactions = [
  {
    id: 1,
    date: "2024-02-15 10:30",
    amount: "0.5 ETH",
    status: "Confirmed",
    type: "Sent",
  },
  {
    id: 2,
    date: "2024-02-14 15:45",
    amount: "100 STC",
    status: "Pending",
    type: "Received",
  },
  {
    id: 3,
    date: "2024-02-13 09:15",
    amount: "0.2 ETH",
    status: "Failed",
    type: "Sent",
  },
];

// Dummy data for NFT receipts
const nftReceipts = [
  { id: "NFT-001", image: "/placeholder.svg?height=100&width=100" },
  { id: "NFT-002", image: "/placeholder.svg?height=100&width=100" },
  { id: "NFT-003", image: "/placeholder.svg?height=100&width=100" },
  { id: "NFT-004", image: "/placeholder.svg?height=100&width=100" },
];

export default function Dashboard() {
  const [walletBalance, setWalletBalance] = useState("1.5 ETH");
  const [walletAddress, setWalletAddress] = useState("0x1234...5678");
  const [tokenBalance, setTokenBalance] = useState("1000 STC"); // Token balance state

  const fetchWalletBalance = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        const balance = await provider.getBalance(accounts[0]);
        setWalletBalance(ethers.formatEther(balance));
      }
    } catch (err) {
      console.error("Error fetching balance", err);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const refreshBalance = () => {
    fetchWalletBalance();
  };

  // const refreshBalance = () => {
  //   // Simulating balance refresh
  //   setWalletBalance("1.6 ETH");
  //   setTokenBalance("1050 STC"); // Simulating token balance refresh
  // };

  return (
    <div className="flex flex-col min-h-screen p-4">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="grid gap-6 md:grid-cols-2 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>MetaMask Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Connected Address
                    </p>
                    <p className="font-medium">{walletAddress}</p>
                  </div>
                  {/* <Button variant="outline" size="sm" onClick={refreshBalance}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button> */}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">{walletBalance}</p>
                </div>
              </CardContent>
            </Card>

            {/* Token Balance Section */}
            <Card>
              <CardHeader>
                <CardTitle>TokenFlow Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <WalletPage />
                  {/* <div>
                    <p className="text-sm text-muted-foreground">
                      Total Tokens
                    </p>
                    <p className="font-medium">{tokenBalance}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshBalance}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-center">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Make a Payment
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" /> View Transactions
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" /> Check NFT Receipts
                </Button>
                {/* Get Token Button */}
                <Link href="/dashboard/getToken">
                  <Button variant="outline" className="w-full">
                    <Wallet className="mr-2 h-4 w-4" /> Get Token
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* <div className="mt-8">
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">
                  Recent Transactions
                </TabsTrigger>
                <TabsTrigger value="nft-receipts">NFT Receipts</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{tx.amount}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.date}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                tx.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : tx.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tx.status}
                            </span>
                            <Button variant="ghost" size="sm" className="ml-2">
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="link" className="mt-4">
                      View All Transactions
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="nft-receipts">
                <Card>
                  <CardHeader>
                    <CardTitle>NFT Receipts Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {nftReceipts.map((nft) => (
                        <div key={nft.id} className="text-center">
                          <Avatar className="w-20 h-20 mx-auto">
                            <AvatarImage
                              src={nft.image}
                              alt={`NFT ${nft.id}`}
                            />
                            <AvatarFallback>{nft.id}</AvatarFallback>
                          </Avatar>
                          <p className="mt-2 text-sm font-medium">{nft.id}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="link" className="mt-4">
                      View All NFT Receipts
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div> */}
        </div>
      </main>
    </div>
  );
}