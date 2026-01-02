# YaGu PDV

Um sistema de Ponto de Venda (PDV) desenvolvido para a YaGu Papelaria, focado em gerenciamento de estoque, caixa e um sistema de carrinho de compras intuitivo.

## Funcionalidades

- **Gestão de Estoque:** Adicione, edite e remova produtos, monitore o estoque mínimo e receba alertas de produtos com baixo estoque.
- **Ponto de Venda (PDV):** Interface para registro rápido de vendas, adição de produtos ao carrinho e finalização de transações.
- **Caixa:** Controle de abertura e fechamento de caixa, registro de entradas e saídas.
- **Relatórios:** Futuramente, geração de relatórios de vendas e estoque para análise.
- **Interface Intuitiva:** Design responsivo e amigável, utilizando componentes modernos para uma melhor experiência do usuário.

## Tecnologias Utilizadas

- **Next.js:** Framework React para construção de aplicações web.
- **React:** Biblioteca JavaScript para construção de interfaces de usuário.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **Tailwind CSS:** Framework CSS utilitário para estilização rápida e responsiva.
- **Radix UI:** Biblioteca de componentes de UI sem estilos para maior customização.
- **pnpm:** Gerenciador de pacotes rápido e eficiente.

## Como Começar

Siga estas instruções para configurar e executar o projeto localmente.

### Pré-requisitos

Certifique-se de ter o `Node.js` (versão 18 ou superior) e o `pnpm` instalados em sua máquina.

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/yagu-pdv.git
    cd yagu-pdv
    ```
2.  Instale as dependências:
    ```bash
    pnpm install
    ```

### Execução

Para iniciar o servidor de desenvolvimento:

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

### Construção para Produção

Para construir o aplicativo para produção:

```bash
pnpm build
```

Para iniciar o aplicativo construído:

```bash
pnpm start
```