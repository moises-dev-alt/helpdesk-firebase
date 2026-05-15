# Helpdesk Firebase

Sistema web de Help Desk feito com React, TypeScript, Vite, Tailwind CSS e Firebase. O app inclui autenticação, controle por perfil, dashboard em tempo real, CRUD de chamados, usuários, relatórios, base de conhecimento, anexos no Storage, notificações e tema light/dark.

## Requisitos

- Node.js 20+
- npm
- Firebase CLI: `npm install -g firebase-tools`
- Projeto Firebase com Authentication, Firestore, Storage e Hosting ativados

## Criar o projeto Firebase

1. Acesse <https://console.firebase.google.com>.
2. Crie um projeto.
3. Ative Authentication com provedor E-mail/senha.
4. Crie um banco Cloud Firestore em modo produção.
5. Ative Firebase Storage.
6. Ative Firebase Hosting.

## Credenciais e ambiente

No Firebase Console, abra Configurações do projeto, crie/consulte o app Web e copie as credenciais. Depois:

```bash
cp .env.example .env
```

Preencha:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Instalação e desenvolvimento

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite.

Enquanto o `.env` estiver com os valores de exemplo, o app entra em modo demo local para permitir login e navegação sem Firebase:

- `admin@helpdesk.com` / `admin123`
- `tecnico@helpdesk.com` / `tecnico123`
- `usuario@helpdesk.com` / `usuario123`

Ao preencher as credenciais reais do Firebase no `.env`, o app passa a usar Authentication, Firestore e Storage reais.

## Build de produção

```bash
npm run build
```

## Deploy

Faça login e vincule ao projeto:

```bash
firebase login
firebase use --add
firebase deploy
```

O `firebase.json` já aponta o Hosting para `dist` e inclui rewrite SPA para React Router.

## Usuários iniciais

O Firebase Authentication não permite criar usuários com senha pelo frontend de forma segura. Use o script opcional com Firebase Admin SDK:

1. No Firebase Console, vá em Configurações do projeto, Contas de serviço.
2. Gere uma nova chave privada e salve como `service-account.json` na raiz do projeto.
3. Configure o `.env` ou variáveis de ambiente:

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
```

4. Execute:

```bash
npm run seed:users
```

Contas criadas:

- `admin@helpdesk.com` / `admin123` / `ADMIN`
- `tecnico@helpdesk.com` / `tecnico123` / `TECHNICIAN`
- `usuario@helpdesk.com` / `usuario123` / `CUSTOMER`

Também é possível criar as contas manualmente no Authentication e depois criar documentos em `users` com o UID gerado.

## Modelo Firestore

Coleções usadas:

- `users`: `uid`, `name`, `email`, `role`, `company`, `active`, `createdAt`
- `tickets`: `title`, `description`, `category`, `priority`, `status`, `customerId`, `customerName`, `assigneeId`, `assigneeName`, `attachments`, `history`, `createdAt`, `updatedAt`, `resolvedAt`
- `comments`: `ticketId`, `authorId`, `authorName`, `message`, `createdAt`
- `notifications`: `userId`, `title`, `message`, `read`, `createdAt`
- `knowledge_articles`: `title`, `content`, `category`, `createdAt`, `updatedAt`

## Segurança

As regras em `firestore.rules` implementam:

- Apenas usuários autenticados e ativos acessam dados.
- `ADMIN` gerencia usuários.
- `CUSTOMER` lê seus próprios chamados.
- `TECHNICIAN` e `ADMIN` leem e atualizam chamados.
- Artigos podem ser lidos por usuários autenticados e gerenciados por `ADMIN`/`TECHNICIAN`.

Publique regras com:

```bash
firebase deploy --only firestore:rules,storage
```

## Rotas

- `/login`
- `/dashboard`
- `/tickets`
- `/tickets/:id`
- `/users`
- `/reports`
- `/knowledge-base`
- `/settings`
