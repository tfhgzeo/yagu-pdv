"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Produto } from "./estoque-context";

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

interface CarrinhoContextType {
  itens: ItemCarrinho[];
  total: number;
  adicionarItem: (produto: Produto) => void;
  removerItem: (produtoId: string) => void;
  alterarQuantidade: (produtoId: string, quantidade: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(
  undefined,
);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const total = itens.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0,
  );
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  const adicionarItem = (produto: Produto) => {
    setItens((prev) => {
      const itemExistente = prev.find((item) => item.produto.id === produto.id);

      if (itemExistente) {
        if (itemExistente.quantidade < produto.estoque) {
          return prev.map((item) =>
            item.produto.id === produto.id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item,
          );
        }
        return prev; // Não adiciona se não há estoque
      } else {
        return [...prev, { produto, quantidade: 1 }];
      }
    });
  };

  const removerItem = (produtoId: string) => {
    setItens((prev) => prev.filter((item) => item.produto.id !== produtoId));
  };

  const alterarQuantidade = (produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade === 0) {
      removerItem(produtoId);
      return;
    }

    setItens((prev) =>
      prev.map((item) =>
        item.produto.id === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item,
      ),
    );
  };

  const limparCarrinho = () => {
    setItens([]);
  };

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        total,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        limparCarrinho,
        totalItens,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (context === undefined) {
    throw new Error("useCarrinho must be used within a CarrinhoProvider");
  }
  return context;
}
