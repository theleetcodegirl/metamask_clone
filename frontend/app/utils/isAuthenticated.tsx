"use client";
import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthWrapperProps {
    children: ReactNode;
}

const IsAuthenticated: React.FC<AuthWrapperProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            setIsAuthenticated(true);
        } else {
            router.push("/login");
        }
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

export default IsAuthenticated;