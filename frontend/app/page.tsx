"use client"

import { useContext, useEffect } from "react";
import { WalletContext } from "@/context/WalletProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, CreditCard, ShoppingBag, ArrowRight, Link, Coins, Receipt, ShoppingCart } from "lucide-react";

export default function LandingPage() {
  const { connected, connectWallet } = useContext(WalletContext);
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  return (
    <div className="w-full">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-2 opacity-10 z-0 pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-700 dark:bg-gray-300 rounded-lg h-full w-full"
          ></div>
        ))}
      </div>
      {/* Hero Section - Full Page */}
      <div className="h-screen flex items-center justify-center px-10 text-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-500">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-6">Welcome to TokenFlow</h1>
          <p className="text-sm text-gray-300 mb-8">
            A Decentralized Payment Gateway with NFT-powered Receipts is
            transforming the way transactions are conducted. By leveraging
            blockchain technology, it ensures secure, transparent, and
            decentralized payments. With NFT-powered receipts, users gain
            verifiable proof of transactions, enhancing trust and authenticity
            in the digital payment ecosystem.
          </p>
          <div className="space-x-4">
            <button
              // variant="outline"
              onClick={connectWallet}
              className="px-6 py-3 text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 z-10"
            >
              {connected ? "Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Page Content (How It Works + Token Value + Featured Products) */}
      <div className="py-16 bg-gray-100 dark:bg-gray-800">
        {/* How It Works Section */}
        <div className="pb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Send ETH
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Connect your wallet and send ETH to our platform.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Get Coin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your ETH is converted to Coin tokens at the current rate.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Purchase Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Use your Coin tokens to buy products in our marketplace.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex p-4 justify-end">
            <Button variant="outline" className="">
              know more
            </Button>
          </div>
        </div>

        {/* Token Value Section */}
        <div className="pb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Token Value
          </h2>
          <div className="flex justify-center">
            <Card>
              <CardHeader>
                <CardTitle>Current Coin Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold pb-2">1 TC = $0.15 USD</p>
                <p className="text-4xl font-bold ">1 TC = 0.01 ETH</p>
              </CardContent>
              {/* <CardFooter>
                <p className="text-sm text-gray-500">
                  Last updated: 2 minutes ago
                </p>
              </CardFooter> */}
            </Card>
          </div>
        </div>

        {/* Featured Products Section */}
        {/* <div className="py-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-10">
            {[1, 2, 3].map((product) => (
              <Card key={product}>
                <CardContent className="p-4">
                  <img
                    src={`/placeholder.svg?height=200&width=300`}
                    alt={`Product ${product}`}
                    className="w-full h-48 object-cover mb-4 rounded-md"
                  />
                  <h3 className="text-xl font-bold mb-2">Product {product}</h3>
                  <p className="text-gray-500 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">100 STC</span>
                    <Button size="sm">
                      Buy Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}
      </div>

      {/* footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 DecentralPay. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}