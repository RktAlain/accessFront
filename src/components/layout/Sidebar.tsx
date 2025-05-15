import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Box,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  FileText,
  Home,
  Settings,
  ShoppingCart,
  ClipboardList,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed?: boolean;
}

const SidebarLink = ({
  to,
  icon: Icon,
  label,
  collapsed = false,
}: SidebarLinkProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "sidebar-item group",
        isActive
          ? "sidebar-item-active"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )
    }
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    {!collapsed && <span>{label}</span>}
    {collapsed && (
      <div className="fixed left-16 ml-6 scale-0 p-2 group-hover:scale-100 transition-all z-50 bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground whitespace-nowrap">
        {label}
      </div>
    )}
  </NavLink>
);

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [openFinance, setOpenFinance] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div
      className={cn(
        "h-screen border-r border-sidebar-border flex flex-col bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between h-16">
        {!collapsed && (
          <div className="text-sidebar-foreground font-semibold text-lg">
            G-Achat
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          <SidebarLink
            to="/dashboard"
            icon={Home}
            label="Tableau de bord"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/demande-achat"
            icon={ClipboardList}
            label="Demandes d'achat"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/achats"
            icon={ShoppingCart}
            label="Gestion d'achat"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/stocks"
            icon={Box}
            label="Gestion des stocks"
            collapsed={collapsed}
          />
          <div>
            <button
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-sidebar-accent/50 hover:text-white  text-white transition"
              onClick={() => setOpenFinance(!openFinance)}
            >
              <CreditCard className="mr-2" />
              <span className={`${collapsed ? "hidden" : "block"}`}>
                Gestion financière
              </span>

              <ChevronDown
                className={`ml-auto transform transition ${
                  openFinance ? "rotate-180" : ""
                }`}
              />
            </button>
            {openFinance && (
              <div className="ml-6 space-y-1">
                <SidebarLink
                  to="/validation"
                  icon={ClipboardCheck}
                  label="Validation"
                  collapsed={collapsed}
                />
                <SidebarLink
                  to="/budgets"
                  icon={CreditCard}
                  label="Budgets"
                  collapsed={collapsed}
                />
              </div>
            )}
          </div>

          <SidebarLink
            to="/factures"
            icon={FileText}
            label="Factures"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/reporting"
            icon={BarChart3}
            label="Rapports"
            collapsed={collapsed}
          />
        </div>

        <Separator className="my-4 bg-sidebar-border" />

        <div className="px-3 space-y-1">
          <SidebarLink
            to="/utilisateurs"
            icon={Users}
            label="Utilisateurs"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/parametres"
            icon={Settings}
            label="Paramètres"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/documentation"
            icon={FileText}
            label="Documentation"
            collapsed={collapsed}
          />
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
            G
          </div>
          {!collapsed && (
            <div className="text-sidebar-foreground text-sm">
              <div className="font-medium">{user?.email}</div>
              <div className="text-sidebar-foreground/70 text-xs">
                {user?.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
