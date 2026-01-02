"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  DollarSign,
  Package,
  TrendingUp,
  Download,
} from "lucide-react";

interface Venda {
  id: string;
  data: string;
  itens: Array<{
    produto: {
      id: string;
      nome: string;
      preco: number;
    };
    quantidade: number;
  }>;
  total: number;
}

export default function RelatoriosPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);

  useEffect(() => {
    // Carregar vendas do localStorage
    const vendasSalvas = JSON.parse(localStorage.getItem("vendas") || "[]");
    setVendas(vendasSalvas);
  }, []);

  // Calcular estatísticas
  const hoje = new Date().toDateString();
  const vendasHoje = vendas.filter(
    (venda) => new Date(venda.data).toDateString() === hoje,
  );

  const totalVendasHoje = vendasHoje.reduce(
    (acc, venda) => acc + venda.total,
    0,
  );
  const totalVendas = vendas.reduce((acc, venda) => acc + venda.total, 0);
  const totalItensVendidos = vendas.reduce(
    (acc, venda) =>
      acc + venda.itens.reduce((itemAcc, item) => itemAcc + item.quantidade, 0),
    0,
  );

  // Produtos mais vendidos
  const produtosMaisVendidos = vendas.reduce(
    (acc, venda) => {
      venda.itens.forEach((item) => {
        const produtoId = item.produto.id;
        if (!acc[produtoId]) {
          acc[produtoId] = {
            nome: item.produto.nome,
            quantidade: 0,
            receita: 0,
          };
        }
        acc[produtoId].quantidade += item.quantidade;
        acc[produtoId].receita += item.produto.preco * item.quantidade;
      });
      return acc;
    },
    {} as Record<string, { nome: string; quantidade: number; receita: number }>,
  );

  const topProdutos = Object.values(produtosMaisVendidos)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  // Vendas por dia (últimos 7 dias)
  const vendasPorDia = Array.from({ length: 7 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dataString = data.toDateString();

    const vendasDoDia = vendas.filter(
      (venda) => new Date(venda.data).toDateString() === dataString,
    );

    return {
      data: data.toLocaleDateString("pt-BR"),
      vendas: vendasDoDia.length,
      receita: vendasDoDia.reduce((acc, venda) => acc + venda.total, 0),
    };
  }).reverse();

  const exportarRelatorio = () => {
    const relatorio = {
      dataGeracao: new Date().toISOString(),
      resumo: {
        totalVendas,
        totalVendasHoje,
        totalItensVendidos,
        numeroVendas: vendas.length,
      },
      produtosMaisVendidos: topProdutos,
      vendasPorDia,
      vendas,
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-yagu-papelaria-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Relatórios - YaGu Papelaria
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Análise de vendas e performance da papelaria
            </p>
          </div>
          <Button onClick={exportarRelatorio} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                R$ {totalVendasHoje.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {vendasHoje.length} transações hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                R$ {totalVendas.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {vendas.length} transações no total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Itens Vendidos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                {totalItensVendidos}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de produtos vendidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                R${" "}
                {vendas.length > 0
                  ? (totalVendas / vendas.length).toFixed(2)
                  : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor médio por venda
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vendas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="vendas" className="text-xs sm:text-sm">
              Vendas
            </TabsTrigger>
            <TabsTrigger value="produtos" className="text-xs sm:text-sm">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="periodo" className="text-xs sm:text-sm">
              Período
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">
                  Vendas Recentes
                </CardTitle>
                <CardDescription>Últimas transações realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                {vendas.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma venda registrada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {vendas
                      .slice(-10)
                      .reverse()
                      .map((venda) => (
                        <div key={venda.id} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <div>
                              <p className="font-medium text-sm lg:text-base">
                                Venda #{venda.id}
                              </p>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {new Date(venda.data).toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <Badge variant="secondary" className="self-start">
                              R$ {venda.total.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            {venda.itens.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-xs lg:text-sm"
                              >
                                <span className="truncate mr-2">
                                  {item.produto.nome} x{item.quantidade}
                                </span>
                                <span className="whitespace-nowrap">
                                  R${" "}
                                  {(
                                    item.produto.preco * item.quantidade
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">
                  Produtos Mais Vendidos
                </CardTitle>
                <CardDescription>
                  Ranking dos produtos por quantidade vendida
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topProdutos.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum produto vendido ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topProdutos.map((produto, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm lg:text-base truncate">
                              {produto.nome}
                            </p>
                            <p className="text-xs lg:text-sm text-gray-600">
                              {produto.quantidade} unidades vendidas
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-green-600 text-sm lg:text-base">
                            R$ {produto.receita.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">receita total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="periodo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">
                  Vendas dos Últimos 7 Dias
                </CardTitle>
                <CardDescription>Performance diária de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendasPorDia.map((dia, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base">
                          {dia.data}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {dia.vendas} {dia.vendas === 1 ? "venda" : "vendas"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-600 text-sm lg:text-base">
                          R$ {dia.receita.toFixed(2)}
                        </p>
                        <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.max(10, (dia.receita / Math.max(...vendasPorDia.map((d) => d.receita))) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
