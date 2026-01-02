"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import { useEstoque } from "@/contexts/estoque-context";
import { useCarrinho } from "@/contexts/carrinho-context";
import { useCaixa } from "@/contexts/caixa-context";

export default function PDVPage() {
  const [busca, setBusca] = useState("");
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const { produtos, atualizarEstoque } = useEstoque();
  const {
    itens,
    total,
    adicionarItem,
    removerItem,
    alterarQuantidade,
    limparCarrinho,
    totalItens,
  } = useCarrinho();
  const { registrarVenda, caixaAtual } = useCaixa();

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const finalizarVenda = () => {
    if (itens.length === 0) return;

    if (!caixaAtual) {
      alert("É necessário abrir o caixa antes de realizar vendas!");
      return;
    }

    // Atualizar estoque
    itens.forEach((item) => {
      atualizarEstoque(item.produto.id, item.quantidade);
    });

    // Registrar venda
    const novaVenda = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      itens: itens.map((item) => ({
        produto: {
          id: item.produto.id,
          nome: item.produto.nome,
          preco: item.produto.preco,
        },
        quantidade: item.quantidade,
      })),
      total,
    };

    registrarVenda(novaVenda);
    limparCarrinho();
    setCarrinhoAberto(false);
    alert("Venda finalizada com sucesso!");
  };

  const CarrinhoContent = () => (
    <div className="space-y-4">
      {itens.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
      ) : (
        <>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {itens.map((item) => (
              <div
                key={item.produto.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.produto.nome}
                  </p>
                  <p className="text-xs text-gray-600">
                    R$ {item.produto.preco.toFixed(2)} cada
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      alterarQuantidade(item.produto.id, item.quantidade - 1)
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">
                    {item.quantidade}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      alterarQuantidade(item.produto.id, item.quantidade + 1)
                    }
                    disabled={item.quantidade >= item.produto.estoque}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removerItem(item.produto.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <Button
              onClick={finalizarVenda}
              className="w-full"
              size="lg"
              disabled={!caixaAtual}
            >
              {!caixaAtual ? "Abra o caixa primeiro" : "Finalizar Venda"}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header com busca e carrinho mobile */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <h1 className="text-xl lg:text-2xl font-bold mb-2">
              PDV - YaGu Papelaria
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Botão do carrinho mobile */}
          <div className="lg:hidden w-full sm:w-auto">
            <Sheet open={carrinhoAberto} onOpenChange={setCarrinhoAberto}>
              <SheetTrigger asChild>
                <Button
                  className="w-full sm:w-auto bg-transparent"
                  variant="outline"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Carrinho ({totalItens})
                  {total > 0 && (
                    <span className="ml-2">- R$ {total.toFixed(2)}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrinho
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <CarrinhoContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {!caixaAtual && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-yellow-800 font-medium">
                ⚠️ Caixa fechado! É necessário abrir o caixa antes de realizar
                vendas.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
              {produtosFiltrados.map((produto) => (
                <Card
                  key={produto.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm lg:text-base line-clamp-2">
                          {produto.nome}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-xs whitespace-nowrap ml-2"
                        >
                          {produto.categoria}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            R$ {produto.preco.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Estoque: {produto.estoque}
                          </p>
                        </div>
                        <Button
                          onClick={() => adicionarItem(produto)}
                          disabled={produto.estoque === 0}
                          size="sm"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Carrinho Desktop */}
          <div className="hidden lg:block">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CarrinhoContent />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
