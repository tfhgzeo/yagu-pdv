"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-context";
import { EstoqueProvider } from "./estoque-context";
import { CaixaProvider } from "./caixa-context";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <EstoqueProvider>
        <CaixaProvider>{children}</CaixaProvider>
      </EstoqueProvider>
    </AuthProvider>
  );
}
