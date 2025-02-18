

// "use client";
// import { useState } from "react";
// import { createWallet, login } from "../utils/api";

// export default function WalletPage() {
//     const [wallet, setWallet] = useState<{ address: string; seed_phrase: string } | null>(null);
//     const [loginData, setLoginData] = useState({ address: "", password: "" });
//     const [password, setPassword] = useState("");
//     const [token, setToken] = useState("");

//     const handleCreateWallet = async () => {
//         const newWallet = await createWallet(password);
//         setWallet(newWallet);
//     };

//     const handleLogin = async () => {
//         const res = await login(loginData.address, loginData.password);
//         if (res.access_token) { 
//             setToken(res.access_token);
//         } else {
//             alert(res.error || "Login failed!");
//         }
//     };
    

//     return (
//         <div className="flex flex-col items-center p-4">
//             <h1 className="text-2xl font-bold">Decentralized Wallet</h1>

//             <div className="mt-4">
//                 <h2>Create Wallet</h2>
//                 <input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="p-2 border rounded"
//                 />
//                 <button onClick={handleCreateWallet} className="ml-2 p-2 bg-blue-500 text-white rounded">
//                     Create
//                 </button>

//                 {wallet && (
//                     <div className="mt-4 p-4 border rounded">
//                         <h3>Wallet Created</h3>
//                         <p><strong>Address:</strong> {wallet.address}</p>
//                         <p><strong>Seed Phrase:</strong> {wallet.seed_phrase}</p>
//                     </div>
//                 )}
//             </div>

//             <div className="mt-4">
//                 <h2>Login</h2>
//                 <input
//                     type="text"
//                     placeholder="Wallet Address"
//                     value={loginData.address}
//                     onChange={(e) => setLoginData({ ...loginData, address: e.target.value })}
//                     className="p-2 border rounded"
//                 />
//                 <input
//                     type="password"
//                     placeholder="Password"
//                     value={loginData.password}
//                     onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                     className="p-2 border rounded"
//                 />
//                 <button onClick={handleLogin} className="ml-2 p-2 bg-green-500 text-white rounded">
//                     Login
//                 </button>

//                 {token && <p className="mt-4">JWT Token: {token}</p>}
//             </div>
//         </div>
//     );
// }