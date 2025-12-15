"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";

export interface MovimentacaoCaixa {
  id: string;
  tipo: "abertura" | "venda" | "sangria" | "suprimento" | "fechamento";
  valor: number;
  descricao: string;
  data: string;
  usuario: string;
}

export interface Caixa {
  id: string;
  dataAbertura: string;
  dataFechamento?: string;
  valorAbertura: number;
  valorFechamento?: number;
  status: "aberto" | "fechado";
  movimentacoes: MovimentacaoCaixa[];
  usuario: string;
}

export interface Venda {
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

interface CaixaContextType {
  caixaAtual: Caixa | null;
  historicoCaixas: Caixa[];
  vendas: Venda[];
  abrirCaixa: (valorInicial: number, descricao?: string) => void;
  fecharCaixa: (valorContado: number) => void;
  adicionarMovimentacao: (
    tipo: "sangria" | "suprimento",
    valor: number,
    descricao: string,
  ) => void;
  registrarVenda: (venda: Venda) => void;
  saldoAtual: number;
  vendasDoDia: Venda[];
  totalVendasDia: number;
}

const CaixaContext = createContext<CaixaContextType | undefined>(undefined);

export function CaixaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [caixaAtual, setCaixaAtual] = useState<Caixa | null>(null);
  const [historicoCaixas, setHistoricoCaixas] = useState<Caixa[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const caixaSalvo = localStorage.getItem("caixaAtual");
    const historicoSalvo = localStorage.getItem("historicoCaixas");
    const vendasSalvas = localStorage.getItem("vendas");

    if (caixaSalvo) {
      setCaixaAtual(JSON.parse(caixaSalvo));
    }

    if (historicoSalvo) {
      setHistoricoCaixas(JSON.parse(historicoSalvo));
    }

    if (vendasSalvas) {
      setVendas(JSON.parse(vendasSalvas));
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (caixaAtual) {
      localStorage.setItem("caixaAtual", JSON.stringify(caixaAtual));
    } else {
      localStorage.removeItem("caixaAtual");
    }
  }, [caixaAtual]);

  useEffect(() => {
    localStorage.setItem("historicoCaixas", JSON.stringify(historicoCaixas));
  }, [historicoCaixas]);

  useEffect(() => {
    localStorage.setItem("vendas", JSON.stringify(vendas));
  }, [vendas]);

  const abrirCaixa = (
    valorInicial: number,
    descricao = "Abertura de caixa",
  ) => {
    if (!user) return;

    const novoCaixa: Caixa = {
      id: Date.now().toString(),
      dataAbertura: new Date().toISOString(),
      valorAbertura: valorInicial,
      status: "aberto",
      usuario: user.email,
      movimentacoes: [
        {
          id: Date.now().toString(),
          tipo: "abertura",
          valor: valorInicial,
          descricao,
          data: new Date().toISOString(),
          usuario: user.email,
        },
      ],
    };

    setCaixaAtual(novoCaixa);
  };

  const fecharCaixa = (valorContado: number) => {
    if (!caixaAtual || !user) return;

    const saldoCalculado = calcularSaldoAtual();
    const diferenca = valorContado - saldoCalculado;

    const caixaFechado: Caixa = {
      ...caixaAtual,
      dataFechamento: new Date().toISOString(),
      valorFechamento: valorContado,
      status: "fechado",
      movimentacoes: [
        ...caixaAtual.movimentacoes,
        {
          id: Date.now().toString(),
          tipo: "fechamento",
          valor: valorContado,
          descricao: `Fechamento de caixa - Diferença: R$ ${diferenca.toFixed(2)}`,
          data: new Date().toISOString(),
          usuario: user.email,
        },
      ],
    };

    setHistoricoCaixas((prev) => [...prev, caixaFechado]);
    setCaixaAtual(null);
  };

  const adicionarMovimentacao = (
    tipo: "sangria" | "suprimento",
    valor: number,
    descricao: string,
  ) => {
    if (!caixaAtual || !user) return;

    const novaMovimentacao: MovimentacaoCaixa = {
      id: Date.now().toString(),
      tipo,
      valor,
      descricao,
      data: new Date().toISOString(),
      usuario: user.email,
    };

    setCaixaAtual((prev) =>
      prev
        ? {
            ...prev,
            movimentacoes: [...prev.movimentacoes, novaMovimentacao],
          }
        : null,
    );
  };

  const registrarVenda = (venda: Venda) => {
    setVendas((prev) => [...prev, venda]);

    // Adicionar movimentação no caixa se estiver aberto
    if (caixaAtual && user) {
      const movimentacaoVenda: MovimentacaoCaixa = {
        id: Date.now().toString() + "_venda",
        tipo: "venda",
        valor: venda.total,
        descricao: `Venda #${venda.id}`,
        data: new Date().toISOString(),
        usuario: user.email,
      };

      setCaixaAtual((prev) =>
        prev
          ? {
              ...prev,
              movimentacoes: [...prev.movimentacoes, movimentacaoVenda],
            }
          : null,
      );
    }
  };

  const calcularSaldoAtual = () => {
    if (!caixaAtual) return 0;

    return caixaAtual.movimentacoes.reduce((saldo, mov) => {
      switch (mov.tipo) {
        case "abertura":
        case "venda":
        case "suprimento":
          return saldo + mov.valor;
        case "sangria":
          return saldo - mov.valor;
        default:
          return saldo;
      }
    }, 0);
  };

  const hoje = new Date().toDateString();
  const vendasDoDia = vendas.filter(
    (venda) => new Date(venda.data).toDateString() === hoje,
  );
  const totalVendasDia = vendasDoDia.reduce(
    (acc, venda) => acc + venda.total,
    0,
  );

  return (
    <CaixaContext.Provider
      value={{
        caixaAtual,
        historicoCaixas,
        vendas,
        abrirCaixa,
        fecharCaixa,
        adicionarMovimentacao,
        registrarVenda,
        saldoAtual: calcularSaldoAtual(),
        vendasDoDia,
        totalVendasDia,
      }}
    >
      {children}
    </CaixaContext.Provider>
  );
}

export function useCaixa() {
  const context = useContext(CaixaContext);
  if (context === undefined) {
    throw new Error("useCaixa must be used within a CaixaProvider");
  }
  return context;
}
