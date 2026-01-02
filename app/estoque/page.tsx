"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Package,
  AlertTriangle,
  Search,
  ListFilter,
  BrushCleaning,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Categoria, useEstoque } from "@/contexts/estoque-context";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
  estoqueMinimo: number;
}

export default function EstoquePage() {
  const {
    categorias,
    produtos,
    atualizarProduto,
    adicionarProduto,
    atualizaCategoria,
  } = useEstoque();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIdalogOpenCategoria, setIsIdalogOpenCategoria] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
    estoque: "",
    categoria: "",
    estoqueMinimo: "",
  });
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    string | null
  >(null);

  const produtosComEstoqueBaixo = produtos.filter(
    (p) => p.estoque <= p.estoqueMinimo,
  );

  const getStatusEstoque = (produto: Produto) => {
    if (produto.estoque === 0) {
      return { label: "Sem estoque", color: "bg-red-100 text-red-800" };
    } else if (produto.estoque <= produto.estoqueMinimo) {
      return { label: "Estoque baixo", color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "Normal", color: "bg-green-100 text-green-800" };
  };

  const produtosFiltrados = produtos.filter((produto) => {
    if (
      categoriaSelecionada != null &&
      produto.categoria === categoriaSelecionada
    ) {
      return produto.nome.toLowerCase().includes(busca.toLowerCase());
    }

    if (categoriaSelecionada === null) {
      return produto.nome.toLowerCase().includes(busca.toLowerCase());
    }
  });

  useEffect(() => {}, [produtos, categorias]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log("form data: ", formData);
    console.log("produto editado: ", produtoEditando);
    e.preventDefault();

    const novoProduto: Produto = {
      id: produtoEditando?.id || Date.now().toString(),
      nome: formData.nome,
      preco: Number.parseFloat(formData.preco),
      estoque: Number.parseInt(formData.estoque),
      categoria: formData.categoria,
      estoqueMinimo: Number.parseInt(formData.estoqueMinimo),
    };
    console.log("novo produto: ", novoProduto);

    if (produtoEditando) {
      atualizarProduto(novoProduto.id, novoProduto);
    } else {
      adicionarProduto(novoProduto);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      preco: "",
      estoque: "",
      categoria: "",
      estoqueMinimo: "",
    });
    setProdutoEditando(null);
  };

  const editarProduto = (produto: Produto) => {
    setProdutoEditando(produto);
    setFormData({
      nome: produto.nome,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
      categoria: produto.categoria,
      estoqueMinimo: produto.estoqueMinimo.toString(),
    });
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Gestão de Estoque - YaGu Papelaria
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Gerencie seus produtos e estoque
            </p>
          </div>

          {/*Botoes de edicao do estoque */}
          <div className="flex justify-center items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>
                    {produtoEditando ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preco">Preço (R$)</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) =>
                          setFormData({ ...formData, preco: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, categoria: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem
                              key={categoria.label}
                              value={categoria.label}
                            >
                              {categoria.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estoque">Quantidade em Estoque</Label>
                      <Input
                        id="estoque"
                        type="number"
                        value={formData.estoque}
                        onChange={(e) =>
                          setFormData({ ...formData, estoque: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                      <Input
                        id="estoqueMinimo"
                        type="number"
                        value={formData.estoqueMinimo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estoqueMinimo: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="flex-1">
                      {produtoEditando ? "Atualizar" : "Cadastrar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isIdalogOpenCategoria}
              onOpenChange={setIsIdalogOpenCategoria}
            >
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Pencil className="mr-2" />
                  Editar Categorias
                </Button>
              </DialogTrigger>
              <DialogContent></DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alertas de Estoque Baixo */}
        {produtosComEstoqueBaixo.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg lg:text-xl">
                <AlertTriangle className="h-5 w-5" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {produtosComEstoqueBaixo.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex justify-between items-center p-2 bg-white rounded"
                  >
                    <span className="font-medium text-sm truncate mr-2">
                      {produto.nome}
                    </span>
                    <Badge
                      variant="destructive"
                      className="text-xs whitespace-nowrap"
                    >
                      {produto.estoque} un.
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de pesquisa e filtro */}
        <div className="relative flex gap-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {/* Botão de status */}
          {/*<DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="cursor-pointer rounded border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 "
            >
              <Button
                variant="ghost"
                className="w-32 flex justify-center items-center "
              >
                {statusSelecionado || "Status"}
                <Milestone className="mr-2 " />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusSelecionado("Normal")}>
                Normal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusSelecionado("Estoque Baixo")}
              >
                Baixo Estoque
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusSelecionado("Sem Estoque")}
              >
                Sem Estoque
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusSelecionado(null)}>
                Limpar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>*/}

          {/*Botão de categoria*/}
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="cursor-pointer rounded border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 "
            >
              <div className="flex justify-center items-center w-32">
                <Button variant="ghost">
                  {categoriaSelecionada || "Categoria"}
                </Button>
                <ListFilter size={16} className="mr-2" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categorias.map((categoria) => (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setCategoriaSelecionada(categoria.label)}
                  key={categoria.label}
                >
                  {categoria.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setCategoriaSelecionada(null)}
              >
                Limpar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/*Botão de limpar os filtros de pesquisa*/}
          <Button
            onClick={() => {
              setCategoriaSelecionada(null);
              setBusca("");
            }}
            className="cursor-pointer rounded border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 text-black"
          >
            <BrushCleaning />
          </Button>
        </div>

        {/* Lista de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ">
          {produtosFiltrados.map((produto) => {
            const status = getStatusEstoque(produto);

            return (
              <Card key={produto.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base lg:text-lg line-clamp-2 flex-1">
                      {produto.nome}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editarProduto(produto)}
                      className="shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Categoria:</span>
                    <Badge
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() => setCategoriaSelecionada(produto.categoria)}
                    >
                      {produto.categoria}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preço:</span>
                    <span className="font-bold text-green-600">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estoque:</span>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">{produto.estoque}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={`${status.color} text-xs`}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500">
                    Estoque mínimo: {produto.estoqueMinimo} unidades
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
