"use client";
import type React from "react";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Lock,
  Plus,
  TrendingDown,
  TrendingUp,
  Unlock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const isClient = typeof window !== "undefined";

interface MovimentacaoCaixa {
  id: string;
  tipo: "abertura" | "venda" | "sangria" | "suprimento" | "fechamento";
  valor: number;
  descricao: string;
  data: string;
  usuario: string;
}

interface Caixa {
  id: string;
  dataAbertura: string;
  dataFechamento?: string;
  valorAbertura: number;
  valorFechamento?: number;
  status: "aberto" | "fechado";
  movimentacoes: MovimentacaoCaixa[];
  usuario: string;
}

export default function Caixa() {
  const [caixaAtual, setCaixaAtual] = useState<Caixa | null>(null);
  const [historicoCaixas, setHistoricoCaixas] = useState<Caixa[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [tipoDialog, setTipoDialog] = useState<
    "abertura" | "sangria" | "suprimento" | "fechamento"
  >("abertura");
  const [formData, setFormData] = useState({
    valor: "",
    descricao: "",
    valorContado: "",
  });

  useEffect(() => {
    const caixaSalvo = localStorage.getItem("caixaAtual");
    const historicoSalvo = localStorage.getItem("historicoCaixas");

    if (caixaSalvo) {
      setCaixaAtual(JSON.parse(caixaSalvo));
    }

    if (historicoSalvo) {
      setHistoricoCaixas(JSON.parse(historicoSalvo));
    }
  }, []);

  // Salvar no localStorage
  const salvarCaixa = (caixa: Caixa | null) => {
    if (caixa) {
      localStorage.setItem("caixaAtual", JSON.stringify(caixa));
    } else {
      localStorage.removeItem("caixaAtual");
    }
    setCaixaAtual(caixa);
  };

  const salvarHistorico = (historico: Caixa[]) => {
    localStorage.setItem("historicoCaixas", JSON.stringify(historico));
    setHistoricoCaixas(historico);
  };

  // Calcular saldo atual do caixa
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

  // Obter vendas do dia para integrar com o caixa
  const obterVendasDoDia = () => {
    if (!isClient) return []; // ⬅️ prevents build-time access
    const vendas = JSON.parse(localStorage.getItem("vendas") || "[]");
    const hoje = new Date().toDateString();
    return vendas.filter(
      (venda: any) => new Date(venda.data).toDateString() === hoje,
    );
  };

  // Abrir caixa
  const abrirCaixa = () => {
    const valorAbertura = Number.parseFloat(formData.valor) || 0;
    const usuario = localStorage.getItem("userEmail") || "Usuário";

    const novoCaixa: Caixa = {
      id: Date.now().toString(),
      dataAbertura: new Date().toISOString(),
      valorAbertura,
      status: "aberto",
      usuario,
      movimentacoes: [
        {
          id: Date.now().toString(),
          tipo: "abertura",
          valor: valorAbertura,
          descricao: formData.descricao || "Abertura de caixa",
          data: new Date().toISOString(),
          usuario,
        },
      ],
    };

    salvarCaixa(novoCaixa);
    resetForm();
    setDialogAberto(false);
  };

  // Adicionar movimentação
  const adicionarMovimentacao = () => {
    if (!caixaAtual) return;

    const valor = Number.parseFloat(formData.valor) || 0;
    const usuario = localStorage.getItem("userEmail") || "Usuário";

    const novaMovimentacao: MovimentacaoCaixa = {
      id: Date.now().toString(),
      tipo: tipoDialog,
      valor,
      descricao:
        formData.descricao ||
        `${tipoDialog.charAt(0).toUpperCase() + tipoDialog.slice(1)}`,
      data: new Date().toISOString(),
      usuario,
    };

    const caixaAtualizado = {
      ...caixaAtual,
      movimentacoes: [...caixaAtual.movimentacoes, novaMovimentacao],
    };

    salvarCaixa(caixaAtualizado);
    resetForm();
    setDialogAberto(false);
  };

  // Fechar caixa
  const fecharCaixa = () => {
    if (!caixaAtual) return;

    const valorContado = Number.parseFloat(formData.valorContado) || 0;
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
          usuario: localStorage.getItem("userEmail") || "Usuário",
        },
      ],
    };

    // Adicionar ao histórico
    const novoHistorico = [...historicoCaixas, caixaFechado];
    salvarHistorico(novoHistorico);

    // Limpar caixa atual
    salvarCaixa(null);
    resetForm();
    setDialogAberto(false);
  };

  const resetForm = () => {
    setFormData({ valor: "", descricao: "", valorContado: "" });
  };

  const abrirDialog = (tipo: typeof tipoDialog) => {
    setTipoDialog(tipo);
    resetForm();
    setDialogAberto(true);
  };

  // Estatísticas do caixa
  const saldoAtual = calcularSaldoAtual();
  const vendasDoDia = obterVendasDoDia();
  const totalVendas = vendasDoDia.reduce(
    (acc: number, venda: any) => acc + venda.total,
    0,
  );
  const totalSangrias =
    caixaAtual?.movimentacoes
      .filter((m) => m.tipo === "sangria")
      .reduce((acc, m) => acc + m.valor, 0) || 0;
  const totalSuprimentos =
    caixaAtual?.movimentacoes
      .filter((m) => m.tipo === "suprimento")
      .reduce((acc, m) => acc + m.valor, 0) || 0;

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Gestão de Caixa - YaGu Papelaria
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Controle de abertura, movimentação e fechamento de caixa
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {!caixaAtual ? (
              <Button
                onClick={() => abrirDialog("abertura")}
                className="w-full sm:w-auto"
              >
                <Unlock className="mr-2 h-4 w-4" />
                Abrir Caixa
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => abrirDialog("sangria")}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Sangria
                </Button>
                <Button
                  onClick={() => abrirDialog("suprimento")}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Suprimento
                </Button>
                <Button
                  onClick={() => abrirDialog("fechamento")}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Fechar Caixa
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status do Caixa */}
        <Card
          className={`border-2 ${caixaAtual ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {caixaAtual ? (
                <>
                  <Unlock className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">Caixa Aberto</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">Caixa Fechado</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {caixaAtual ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Abertura</p>
                  <p className="text-lg font-bold">
                    R$ {caixaAtual.valorAbertura.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(caixaAtual.dataAbertura).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Saldo Atual</p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {saldoAtual.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vendas do Dia</p>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {totalVendas.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {vendasDoDia.length} transações
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Operador</p>
                  <p className="text-sm font-medium">{caixaAtual.usuario}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Nenhum caixa aberto. Clique em "Abrir Caixa" para iniciar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        {caixaAtual && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valor Inicial
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">
                  R$ {caixaAtual.valorAbertura.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Vendas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  R$ {totalVendas.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sangrias</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-red-600">
                  R$ {totalSangrias.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Suprimentos
                </CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-blue-600">
                  R$ {totalSuprimentos.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="movimentacoes" className="space-y-4 mt-5">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Movimentações do Caixa Atual
              </CardTitle>
              <CardDescription>
                Todas as movimentações do caixa aberto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!caixaAtual || caixaAtual.movimentacoes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma movimentação registrada
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {caixaAtual.movimentacoes.map((mov) => (
                    <div
                      key={mov.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`p-2 rounded-full ${
                            mov.tipo === "abertura"
                              ? "bg-blue-100"
                              : mov.tipo === "venda"
                                ? "bg-green-100"
                                : mov.tipo === "sangria"
                                  ? "bg-red-100"
                                  : mov.tipo === "suprimento"
                                    ? "bg-yellow-100"
                                    : "bg-gray-100"
                          }`}
                        >
                          {mov.tipo === "abertura" && (
                            <Unlock className="h-4 w-4 text-blue-600" />
                          )}
                          {mov.tipo === "venda" && (
                            <DollarSign className="h-4 w-4 text-green-600" />
                          )}
                          {mov.tipo === "sangria" && (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          {mov.tipo === "suprimento" && (
                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                          )}
                          {mov.tipo === "fechamento" && (
                            <Lock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm lg:text-base truncate">
                            {mov.descricao}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600">
                            {new Date(mov.data).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-bold text-sm lg:text-base ${
                            mov.tipo === "sangria"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {mov.tipo === "sangria" ? "-" : "+"}R${" "}
                          {mov.valor.toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Histórico de Caixas
              </CardTitle>
              <CardDescription>Caixas anteriores fechados</CardDescription>
            </CardHeader>
            <CardContent>
              {historicoCaixas.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum caixa fechado ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {historicoCaixas
                    .slice(-10)
                    .reverse()
                    .map((caixa) => {
                      const diferenca =
                        (caixa.valorFechamento || 0) -
                        caixa.movimentacoes.reduce((acc, mov) => {
                          if (mov.tipo === "fechamento") return acc;
                          return mov.tipo === "sangria"
                            ? acc - mov.valor
                            : acc + mov.valor;
                        }, 0);

                      return (
                        <div key={caixa.id} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <div>
                              <p className="font-medium text-sm lg:text-base">
                                Caixa #{caixa.id}
                              </p>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {new Date(
                                  caixa.dataAbertura,
                                ).toLocaleDateString("pt-BR")}{" "}
                                - {caixa.usuario}
                              </p>
                            </div>
                            <Badge
                              variant={
                                diferenca === 0
                                  ? "default"
                                  : diferenca > 0
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {diferenca === 0
                                ? "Conferido"
                                : diferenca > 0
                                  ? "Sobra"
                                  : "Falta"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Abertura</p>
                              <p className="font-bold">
                                R$ {caixa.valorAbertura.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Fechamento</p>
                              <p className="font-bold">
                                R$ {(caixa.valorFechamento || 0).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Movimentações</p>
                              <p className="font-bold">
                                {caixa.movimentacoes.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Diferença</p>
                              <p
                                className={`font-bold ${diferenca >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                R$ {diferenca.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para operações */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>
              {tipoDialog === "abertura" && "Abrir Caixa"}
              {tipoDialog === "sangria" && "Sangria do Caixa"}
              {tipoDialog === "suprimento" && "Suprimento do Caixa"}
              {tipoDialog === "fechamento" && "Fechar Caixa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {tipoDialog === "fechamento" ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Saldo Calculado:</span>
                    <span className="font-bold">
                      R$ {saldoAtual.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="valorContado">
                    Valor Contado no Caixa (R$)
                  </Label>
                  <Input
                    id="valorContado"
                    type="number"
                    step="0.01"
                    value={formData.valorContado}
                    onChange={(e) =>
                      setFormData({ ...formData, valorContado: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                {formData.valorContado && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Diferença:</p>
                    <p
                      className={`text-lg font-bold ${
                        Number.parseFloat(formData.valorContado) - saldoAtual >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      R${" "}
                      {(
                        Number.parseFloat(formData.valorContado) - saldoAtual
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder="Descreva a operação..."
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={
                  tipoDialog === "abertura"
                    ? abrirCaixa
                    : tipoDialog === "fechamento"
                      ? fecharCaixa
                      : adicionarMovimentacao
                }
                className="flex-1"
                disabled={
                  tipoDialog === "fechamento"
                    ? !formData.valorContado
                    : !formData.valor
                }
              >
                {tipoDialog === "abertura" && "Abrir Caixa"}
                {tipoDialog === "sangria" && "Registrar Sangria"}
                {tipoDialog === "suprimento" && "Registrar Suprimento"}
                {tipoDialog === "fechamento" && "Fechar Caixa"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAberto(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
