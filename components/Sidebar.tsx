"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  DollarSign,
  Settings,
  AlertCircle,
  LogOut,
  UserCog,
} from "lucide-react";
import Image from "next/image";
import icon from "@/assets/jsr finance icon.jpg";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Loans", href: "/loans", icon: FileText },
  { name: "Payments", href: "/payments", icon: DollarSign },
  {
    name: "Overdue Payments",
    href: "/admin/overdue-payments",
    icon: AlertCircle,
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  name: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-800 py-2">
      <Image
        src={icon}
        width={90}
        height={90}
        alt="icon"
        className="rounded-full self-center"
      />
      <div className="flex h-16 items-center justify-center">
        <h1 className="text-2xl font-bold text-white">JSR Finance</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              </li>
            );
          })}
          {user?.role === "ADMIN" && (
            <li>
              <Link
                href="/admin/users"
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                  pathname === "/admin/users"
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <UserCog className="mr-3 h-6 w-6" />
                User Management
              </Link>
            </li>
          )}
        </ul>
      </nav>
      {user && (
        <div className="border-t border-gray-700 p-4">
          <div className="mb-2 text-sm text-gray-300">
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-xs text-gray-400">{user.role}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
