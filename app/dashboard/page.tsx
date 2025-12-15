"use client";
import type React from "react";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

import { useCaixa, Venda } from "@/contexts/caixa-context";
import { useEstoque } from "@/contexts/estoque-context";

export default function Dashboard() {
  const { saldoAtual, totalVendasDia, vendasDoDia } = useCaixa();
  const { produtos, produtosComEstoqueBaixo } = useEstoque();

  const stats = {
    vendasHoje: totalVendasDia,
    produtosEstoque: produtos.length,
    vendasMes: totalVendasDia * 30, // Simulação
    crescimento: 12.5,
  };
  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Div do header do dashboard*/}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Dashboard - YaGu Papelaria
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">Visão geral</p>
        </div>

        {/* Div dos cards de valores do dashboard*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Card de total de vendas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">0 transações hoje</p>
            </CardContent>
          </Card>

          {/* Card de estoque */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos em Estoque
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                {stats.produtosEstoque}
              </div>
              <p className="text-xs text-muted-foreground">
                {produtosComEstoqueBaixo.length} produtos com estoque baixo
              </p>
            </CardContent>
          </Card>

          {/* Card de saldo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo em Caixa
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                R$ {saldoAtual.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo atual do caixa
              </p>
            </CardContent>
          </Card>

          {/* Card de crescimento */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                {stats.crescimento}%
              </div>
              <p className="text-xs text-muted-foreground">
                Crescimento mensal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Div de informações de vendas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Card de vendas recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Vendas Recentes
              </CardTitle>
              <CardDescription>Últimas transações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendasDoDia
                  .slice(-3)
                  .reverse()
                  .map((venda) => (
                    <div
                      key={venda.id}
                      className="flex justify-between items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base truncate">
                          Venda #{venda.id}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {new Date(venda.data).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                      <p className="font-bold text-sm lg:text-base ml-2">
                        R$ {venda.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
                {vendasDoDia.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma venda hoje
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de produtos em falta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Produtos em Falta
              </CardTitle>
              <CardDescription>
                Produtos que precisam de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {produtosComEstoqueBaixo.slice(0, 3).map((produto) => (
                  <div
                    key={produto.id}
                    className="flex justify-between items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm lg:text-base truncate">
                        {produto.nome}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600">
                        Mínimo: {produto.estoqueMinimo}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs lg:text-sm ml-2 whitespace-nowrap ${
                        produto.estoque === 0
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {produto.estoque} un.
                    </span>
                  </div>
                ))}
                {produtosComEstoqueBaixo.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Todos os produtos com estoque adequado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
