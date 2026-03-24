# Regras de Negócio - PluxSales MVP

Este documento resume as principais regras de negócio implementadas no sistema PluxSales.

## 1. Gestão de Usuários e Acessos

### 1.1 Papéis (Roles)
- **ADMIN**: Acesso total ao sistema, incluindo configurações críticas e gestão de usuários.
- **MANAGER**: Focado em gestão operacional (estoque, produtos, relatórios e dashboard).
- **CASHIER**: Focado na operação de venda e consulta de histórico de vendas.

### 1.2 Licenciamento
- O acesso ao sistema é condicionado ao status da licença (`ACTIVE`, `TRIAL`, `PAID`).
- Se o status for `EXPIRED`, o usuário é redirecionado para uma tela de bloqueio, permitindo apenas a saída da conta.

## 2. Gestão de Inventário (Ingredientes)

### 2.1 Cadastro e Unidades
- Ingredientes suportam unidades de medida: `g`, `ml`, `un`, `kg`, `L`.
- Cada item possui um **Preço de Custo** e um **Custo Unitário** (baseado na unidade de medida).

### 2.2 Movimentação de Estoque
- **Entrada (IN)**: Reposição manual ou via compras.
- **Saída (OUT)**: Baixa automática realizada no momento da venda de um produto.
- **Quebra (WASTE)**: Registro de perdas com motivos específicos (`VALIDADE`, `AVARIA`, `PROCESSO`).
- **Ajuste (ADJUSTMENT)**: Correções manuais de inventário.

### 2.3 Alertas
- O sistema monitora o estoque mínimo (configurável) e gera notificações de "Estoque Baixo".

## 3. Gestão de Produtos e Engenharia de Cardápio

### 3.1 Composição (Ficha Técnica)
- Produtos são compostos por uma lista de ingredientes com quantidades específicas.
- O **CMV (Custo de Mercadoria Vendida)** do produto é calculado automaticamente somando o custo proporcional de cada ingrediente.

### 3.2 Precificação e Margem
- O sistema permite definir o preço de venda e monitora a margem de lucro baseada no CMV atualizado.

### 3.3 Perfil Fiscal
- Cada produto possui um perfil fiscal detalhado:
    - **NCM**: Obrigatório (8 dígitos).
    - **Regime Tributário**: Simples Nacional, Lucro Presumido ou Real.
    - **Classificação**: Tributado, Isento, Imune, ST, etc.
    - **CSTs**: Configuração de PIS, COFINS e ICMS.

## 4. Operação de Vendas (PDV)

### 4.1 Sessão de Caixa
- É obrigatório abrir o caixa (`Register Session`) informando um valor inicial para realizar vendas.
- O fechamento do caixa confronta o valor esperado (Abertura + Vendas) com o valor físico informado, registrando a diferença.

### 4.2 Processamento de Venda
- Suporta múltiplos métodos de pagamento: `DINHEIRO`, `PIX`, `CRÉDITO`, `DÉBITO`.
- No momento da venda:
    1. Registra-se a transação financeira.
    2. Realiza-se a baixa automática dos ingredientes no estoque.
    3. Gera-se um ticket para a cozinha.

## 5. Cozinha e Operações (KDS)

### 5.1 Fluxo de Pedidos
- Pedidos entram como `PENDENTE`.
- Estados seguintes: `PREPARANDO` -> `PRONTO` -> `ENTREGUE`.
- Quando um pedido é marcado como `PRONTO`, o sistema gera uma notificação para o salão/balcão.

### 5.2 Setores
- Vendas podem ser segmentadas por setores: `SALÃO`, `TERRAÇO`, `BALCÃO`, `DELIVERY`.

## 6. Inteligência e Auditoria

### 6.1 Logs de Atividade
- Todas as ações críticas (alteração de preço, exclusão de itens, abertura de caixa) são registradas em um log de auditoria com timestamp e identificação do usuário.

### 6.2 Analytics
- O sistema calcula:
    - Faturamento total vs. Custo total.
    - Custo de quebras (Waste).
    - Performance por setor (Margem e Volume).
    - Ranking de produtos mais vendidos.

## 7. Conformidade Fiscal
- Validação rigorosa de NCM.
- Suporte a perfis fiscais (`CONSERVADOR`, `MODERADO`, `ARROJADO`) para estratégias de tributação.
- Detalhamento de impostos (IBS/CBS) conforme as normas vigentes.
