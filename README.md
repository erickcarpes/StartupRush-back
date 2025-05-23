# ⚙️ StartupRush - Back-end

Este repositório contém o back-end da aplicação **StartupRush**, uma plataforma para gerenciamento de torneios entre startups com lógica de batalhas eliminatórias, pontuação dinâmica e rankings automatizados.

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript no servidor.
- **TypeScript**: Superset do JavaScript com tipagem estática.
- **Express**: Framework web para construção de APIs.
- **Prisma ORM**: ORM para interagir com o banco de dados MongoDB.
- **MongoDB**: Banco de dados NoSQL utilizado para armazenar dados da aplicação.

## 📦 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma instância do [MongoDB](https://account.mongodb.com/account/login) Atlas
- Voce vai precisar criar um projeto e criar um cluster, com o cluster criado vai clicar no botão "Connect" e se conectar via Drivers. Siga os passos para a conexão e copie a string da aplicação.

### Passos

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/erickcarpes/StartupRush-back.git
   cd StartupRush-back

2. **Instale as dependências:**

   ```bash
   npm install

3. **Configure as variáveis de ambiente:**

    Crie um .env na raiz do seu projeto e:

   ```.env
   DATABASE_URL="mongodb://localhost:27017/startuprush"

   Substitua a URL pela string de conexão que você copiou anteriormente e substitua "<db_password>" pela senha do seu banco de dados. E coloque o nome do seu banco de dados, após o "?".

4. **Gere os artefatos do prisma:**

   ```bash
   npx prisma generate

5. **Inicie o servidor localmente:**

   ```bash
   npm run dev          

6. **Integração com o front-end:**

   Certifique-se de que o front-end da aplicação (disponível em [StartupRush-front](https://github.com/erickcarpes/StartupRush-front/tree/main)) esteja com a variável VITE_API_URL apontando para o endereço onde o servidor back-end está rodando (por padrão, http://localhost:3000).