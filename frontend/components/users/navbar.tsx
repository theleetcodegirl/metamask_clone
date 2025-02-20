"use client"

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import ThemeToggle from "./theme";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter()

  const handleSignup = () => {
    // Navigate to the BuyToken page
    router.push('/signup');
  };

  const handleLogin = () => {
    // Navigate to the BuyToken page
    router.push('/login');
  };

  const handleOnClick = () => {
    if (isLoggedIn) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <nav className="shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/dashboard" className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">TokenFlow</Link>

        <div className="flex space-x-12">
          <Link href="/dashboard/payments" className="font-semibold hover:text-blue-700">
            Payment
          </Link>
          <Link href="/transactions" className="font-semibold hover:text-blue-700">
            History
          </Link>
          <Link href="/dashboard/receipts" className=" font-semibold hover:text-blue-700">
            Receipt
          </Link>
          {/* <Link href="/dashboard/exchangeRate" className=" font-semibold hover:text-blue-700">
            ExchangeRate
          </Link> */}
          <Link href="/dashboard/swapTokens" className="font-semibold hover:text-blue-700">
            Swap
          </Link>
          <Link href="/dashboard/buyToken" className="font-semibold hover:text-blue-700">
            Buy Token
          </Link>

        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            className="font-semibold"
            onClick={handleOnClick}
          >
            {isLoggedIn ? "Login" : "Signup"}
          </Button>
          {/* <Button variant="outline" className="font-semibold" onClick={handleOnClicKBuyToken}>Signup</Button> */}
        </div>
      </div>
    </nav>
  );
}