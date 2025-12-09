# 💰 FinTrack — Sistema de Gestão Bancária (Node.js + Firebase)

O **FinTrack** é uma aplicação web de controle financeiro pessoal, desenvolvida com **Node.js**, **Express** e **Firebase**.  
O sistema permite realizar depósitos, saques, visualizar saldo atualizado automaticamente e acompanhar o histórico de movimentações — tudo em **tempo real**, graças à integração com o Firestore.

Projeto desenvolvido como prática de back-end, lógica de programação, conexão com banco de dados em nuvem e criação de APIs simples.

---

## 🚀 Funcionalidades

- 🔐 **Login simples** (e/ou identificação de usuário)
- 💸 **Depósito** de valores  
- 🧾 **Saque** com validação automática  
- 💲 **Saldo sincronizado em tempo real** via Firebase  
- 📊 **Histórico de transações** (opcional segundo a versão)  
- 🔄 Interface dinâmica com atualização instantânea  
- ☁️ Banco de dados totalmente na nuvem (Firestore)

---

## 🛠️ Tecnologias Utilizadas

### **Back-end**
- Node.js  
- Express  
- Firebase Admin SDK  

### **Banco de Dados**
- Firebase Firestore (NoSQL)

### **Front-end**
- HTML  
- CSS  
- JavaScript Vanilla  

### **Ferramentas**
- Git & GitHub  
- Nodemon  
- Postman (para testes da API, opcional)

---

## 📁 Estrutura do Projeto

/fintrack
├── public/ # Front-end (HTML, CSS, JS)
├── src/
│ ├── routes/ # Rotas da aplicação
│ ├── controllers # Lógica de depósito/saque
│ ├── config/ # Firebase config
│ └── app.js # App principal
├── package.json
├── README.md

---

## ⚙️ Como Rodar o Projeto Localmente

### 🔧 1. Clone o repositório
git clone https://github.com/arthurho22/fintrack
cd fintrack

## 2. Instale as dependências
- npm install

## 🔥 3. Configure o Firebase
Crie um arquivo:
- /src/config/firebase.js
Com o seguinte modelo:
- const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://SEU-PROJETO.firebaseio.com"
});

module.exports = admin;

## ▶️ 4. Inicie o servidor
- npm start

## O servidor rodará em:
- http://localhost:3000
- 
## 🧠 Aprendizados

Durante o desenvolvimento deste projeto, foram aplicados e reforçados:

Manipulação de dados em tempo real com Firebase

Lógica de transações (depósito/saque)

Estrutura de API com Node.js e Express

Fluxo de atualização automática de saldo

Organização de projeto full stack

Uso de NoSQL na prática

## 📌 Próximos Passos (Roadmap)

Autenticação com Firebase Auth

Histórico detalhado de transações

Interface mais moderna usando Tailwind CSS

Relatórios financeiros

Deploy online (Vercel / Render)

## 👨‍💻 Autor

Arthur Guilherme Hoffmann
Desenvolvedor Full Stack Júnior
LinkedIn

GitHub: https://github.com/arthurho22

## ⭐ Contribuição

Contribuições são bem-vindas!
Sinta-se à vontade para abrir issues, sugerir melhorias ou enviar pull requests.
