"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
  estoqueMinimo: number;
}

export interface Categoria {
  label: string;
  status: boolean;
  id: number;
}

interface EstoqueContextType {
  produtos: Produto[];
  adicionarProduto: (produto: Omit<Produto, "id">) => void;
  atualizarProduto: (id: string, produto: Partial<Produto>) => void;
  atualizaCategoria: (id: string, produto: Partial<Categoria>) => void;
  removerProduto: (id: string) => void;
  atualizarEstoque: (id: string, quantidade: number) => void;
  obterProduto: (id: string) => Produto | undefined;
  produtosComEstoqueBaixo: Produto[];
  categorias: Categoria[];
}

const EstoqueContext = createContext<EstoqueContextType | undefined>(undefined);

export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Carregar produtos do localStorage
  useEffect(() => {
    // Produtos iniciais se não houver dados salvos
    const produtosIniciais: Produto[] = [
      {
        id: "1",
        nome: "Caderno Universitário 200fls",
        preco: 15.9,
        estoque: 45,
        categoria: "Material Escolar",
        estoqueMinimo: 20,
      },
      {
        id: "2",
        nome: "Caneta BIC Azul",
        preco: 2.5,
        estoque: 49,
        categoria: "Material Escolar",
        estoqueMinimo: 50,
      },
      {
        id: "3",
        nome: "Lápis HB Faber-Castell",
        preco: 1.8,
        estoque: 80,
        categoria: "Material Escolar",
        estoqueMinimo: 30,
      },
      {
        id: "4",
        nome: "Papel A4 500 folhas",
        preco: 28.9,
        estoque: 25,
        categoria: "Material de Escritório",
        estoqueMinimo: 15,
      },
      {
        id: "5",
        nome: "Grampeador Pequeno",
        preco: 18.5,
        estoque: 15,
        categoria: "Material de Escritório",
        estoqueMinimo: 8,
      },
      {
        id: "6",
        nome: "Cola Bastão 40g",
        preco: 8.9,
        estoque: 35,
        categoria: "Material Escolar",
        estoqueMinimo: 20,
      },
      {
        id: "7",
        nome: "Borracha Branca",
        preco: 1.2,
        estoque: 60,
        categoria: "Material Escolar",
        estoqueMinimo: 25,
      },
      {
        id: "8",
        nome: "Marca-texto Amarelo",
        preco: 4.5,
        estoque: 40,
        categoria: "Material Escolar",
        estoqueMinimo: 15,
      },
      {
        id: "9",
        nome: "Pasta Catálogo",
        preco: 12.9,
        estoque: 20,
        categoria: "Material de Escritório",
        estoqueMinimo: 10,
      },
      {
        id: "10",
        nome: "Tinta Guache 12 cores",
        preco: 24.9,
        estoque: 18,
        categoria: "Artigos de Arte",
        estoqueMinimo: 12,
      },
    ];
    setProdutos(produtosIniciais);
    localStorage.setItem("produtos", JSON.stringify(produtosIniciais));
  }, []);

  // Salvar produtos no localStorage sempre que houver mudança
  useEffect(() => {
    if (produtos.length > 0) {
      localStorage.setItem("produtos", JSON.stringify(produtos));
    }
  }, [produtos]);

  // carrega as categorias
  useEffect(() => {
    setCategorias([
      { label: "Material Escolar", status: true, id: 1 },
      { label: "Material de Escritório", status: true, id: 2 },
      { label: "Artigos de Arte", status: true, id: 3 },
      { label: "Impressão e Cópias", status: true, id: 4 },
      { label: "Presentes", status: true, id: 5 },
      { label: "Livros e Revistas", status: true, id: 6 },
      { label: "Outros", status: true, id: 7 },
    ]);
  }, []);

  // Salva categorias no localStorage sempre que houver mudança
  useEffect(() => {
    if (categorias.length > 0) {
      localStorage.setItem("categorias", JSON.stringify(categorias));
    }
  }, [categorias]);

  const adicionarProduto = (novoProduto: Omit<Produto, "id">) => {
    const produto: Produto = {
      ...novoProduto,
      id: Date.now().toString(),
    };
    setProdutos((prev) => [...prev, produto]);
  };

  const atualizarProduto = (id: string, dadosAtualizados: Partial<Produto>) => {
    setProdutos((prev) =>
      prev.map((produto) =>
        produto.id === id ? { ...produto, ...dadosAtualizados } : produto,
      ),
    );
  };

  const atualizarCategoria = (
    id: number,
    dadosAtualizados: Partial<Categoria>,
  ) => {
    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === id ? { ...categoria, ...dadosAtualizados } : categoria,
      ),
    );
  };

  const removerProduto = (id: string) => {
    setProdutos((prev) => prev.filter((produto) => produto.id !== id));
  };

  const atualizarEstoque = (id: string, quantidade: number) => {
    setProdutos((prev) =>
      prev.map((produto) =>
        produto.id === id
          ? { ...produto, estoque: produto.estoque - quantidade }
          : produto,
      ),
    );
  };

  const obterProduto = (id: string) => {
    return produtos.find((produto) => produto.id === id);
  };

  const produtosComEstoqueBaixo = produtos.filter(
    (produto) => produto.estoque <= produto.estoqueMinimo,
  );

  return (
    <EstoqueContext.Provider
      value={{
        produtos,
        adicionarProduto,
        atualizarProduto,
        removerProduto,
        atualizarEstoque,
        obterProduto,
        produtosComEstoqueBaixo,
        categorias,
        atualizarCategoria,
      }}
    >
      {children}
    </EstoqueContext.Provider>
  );
}

export function useEstoque() {
  const context = useContext(EstoqueContext);
  if (context === undefined) {
    throw new Error("useEstoque must be used within an EstoqueProvider");
  }
  return context;
}
