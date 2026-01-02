"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-context";
import { EstoqueProvider } from "./estoque-context";
import { CaixaProvider } from "./caixa-context";
import { CarrinhoProvider } from "./carrinho-context";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <EstoqueProvider>
        <CarrinhoProvider>
          <CaixaProvider>{children}</CaixaProvider>
        </CarrinhoProvider>
      </EstoqueProvider>
    </AuthProvider>
  );
}
