"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  LogOut,
  Menu,
  DollarSign,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Caixa",
    href: "/caixa",
    icon: DollarSign,
  },
  {
    title: "PDV - Vendas",
    href: "/pdv",
    icon: ShoppingCart,
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
  },
];

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    onItemClick?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold">YaGu Papelaria</h2>
        {user && <p className="text-sm text-orange-200">Olá, {user.name}</p>}
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} onClick={onItemClick}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start text-white hover:text-orange-900 hover:bg-orange-500"
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full text-white hover:text-orange-900"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-orange-900 text-white min-h-screen p-4">
        <SidebarContent />
      </div>

      {/* Mobile Header with Menu */}
      <div className="lg:hidden bg-orange-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">YaGu Papelaria</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-orange-900 text-white border-orange-800 p-4"
          >
            <SidebarContent onItemClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
