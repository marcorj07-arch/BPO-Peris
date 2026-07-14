# BPO Financeiro · Periscópio Contabilidade

App de controle financeiro (iOS/Android) com dois módulos — **Pessoal** (Marco
Pontes) e **Periscópio (PJ)** — compartilhando o mesmo modelo de dados e
backend, para que os dois usuários vejam sempre as mesmas informações.

Implementado a partir da especificação técnica validada em protótipo (React).
Ver `supabase/migrations/0001_init.sql` para o schema e os comentários em
`src/lib/*.ts` para a lógica de negócio (parsing de valores, parcelamento,
contas recorrentes, fluxo de caixa projetado, conciliação bancária OFX).

## Stack

- **App**: Expo (React Native + TypeScript) com [expo-router](https://docs.expo.dev/router/introduction/)
- **Backend**: [Supabase](https://supabase.com) (Postgres + Auth + Realtime + Row Level Security)
- **Excel**: [xlsx](https://www.npmjs.com/package/xlsx) (SheetJS)
- **Testes**: Jest (lógica de negócio pura em `src/lib`)

## Estrutura

```
app/                      rotas (expo-router)
  login.tsx
  (app)/                  área autenticada
    (tabs)/                Lançamentos · Recorrentes · Fluxo de Caixa · Conciliação · Mais
    transaction/           novo lançamento / edição (modais)
src/
  types/                  modelo de dados (Transaction, RecurringTemplate, §2 da spec)
  lib/                    lógica de negócio pura, testada (parseAmount, installments,
                          recurring, cashflow, ofx, excel, batchLaunch, date, transactions)
  lib/__tests__/          testes Jest da lógica acima
  supabase/               client + camada de acesso a dados (api.ts)
  context/                AuthContext, DataContext (CRUD + realtime), ModuleContext
  components/             UI reutilizável (tema Periscópio)
  theme/                  cores e tipografia (Brand Guidelines v2.0, §5 da spec)
supabase/migrations/      schema SQL + RLS
```

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (plano gratuito
   atende 2 usuários).
2. No SQL Editor, rode `supabase/migrations/0001_init.sql` — cria as tabelas
   `transactions` e `recurring_templates`, os índices, as policies de RLS e
   habilita Realtime.
3. Em **Authentication → Providers**, deixe apenas e-mail/senha habilitado e
   **desative "Allow new users to sign up"** — o app não tem tela de
   cadastro; os dois usuários (Marco e a sócia) devem ser criados
   manualmente em **Authentication → Users → Add user**, com a política de
   RLS liberando acesso total a qualquer usuário autenticado do projeto (ou
   seja, o controle de quem entra é feito pelo Supabase Auth, não pelo app).
4. Copie a **Project URL** e a **anon public key** (Settings → API).

### 3. Variáveis de ambiente

```bash
cp .env.example .env
# edite .env com a URL e a anon key do passo anterior
```

### 4. Rodar

```bash
npm start        # abre o Expo Dev Tools — escaneie o QR com o Expo Go
npm run android  # emulador/dispositivo Android
npm run ios      # simulador iOS (requer macOS)
```

## Testes e verificação de tipos

```bash
npm test         # Jest — lógica de negócio pura (parsing, parcelas, recorrência, OFX, etc.)
npm run typecheck
```

## Publicação nas lojas (EAS Build)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios       # requer Apple Developer Program (~US$99/ano)
eas submit --platform android  # requer Google Play Console (US$25 único)
eas submit --platform ios
```

O review da Apple costuma levar alguns dias — planeje com antecedência.

## Migração de dados do protótipo

O protótipo (artifact React / versão HTML) guarda os dados em
`localStorage`/`window.storage`, que não é portável automaticamente para o
Supabase. Use a exportação para Excel do próprio protótipo como referência e
lance os saldos iniciais manualmente na tela **Lançamentos** do app — não há
importador automático de planilha nesta primeira versão (a exportação
`.xlsx`, sim, já está implementada em **Mais → Exportar**).

## Limitações conhecidas

- **Contas anuais na projeção de fluxo de caixa** (§4.6 da spec): o modelo
  atual trata todo template recorrente como mensal, então uma conta anual
  (IPVA, seguro do carro) marcada com ★ infla a projeção de despesas em
  todos os 12 meses. Correção sugerida: adicionar `frequency: "mensal" |
  "anual"` ao `recurring_templates` e só projetar itens anuais no mês do
  último lançamento real.
- **Categorias fixas** (§3): não são customizáveis pelo usuário ainda.
- **Sincronização em tempo real**: implementada via Supabase Realtime
  (qualquer alteração em `transactions`/`recurring_templates` atualiza os
  dois dispositivos automaticamente), mas não foi testada sob concorrência
  pesada (dois lançamentos simultâneos na mesma linha).
