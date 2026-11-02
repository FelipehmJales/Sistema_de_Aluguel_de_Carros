# Sistema_de_Aluguel_de_Carros

# Sistema de Aluguel de Carros (DriveSys)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![JSON Server](https://img.shields.io/badge/JSON_Server-000000?style=for-the-badge&logo=json&logoColor=white)

> **Pontifícia Universidade Católica de Minas Gerais (PUC Minas)**  
> **Curso:** Ciências da Computação (2º Período - Manhã)  
> **Disciplina:** Desenvolvimento de Interfaces Web (DIW) — Laboratório 02  
> **Professor:** João Paulo Carneiro Aramuni  

---

## 📌 Descrição do Projeto

O **DriveSys** é um sistema web de apoio à gestão de aluguéis de automóveis que permite efetuar, consultar, modificar e cancelar pedidos através da Internet. O sistema exige cadastro prévio dos contratantes (armazenando identificação civil, endereço, profissão e até 3 entidades empregadoras/rendimentos) e integra um fluxo completo de análise financeira por agentes (empresas locadoras e bancos), permitindo associar contratos de crédito bancário e registar a titularidade do veículo conforme a modalidade contratual.

---

## 👥 Integrantes

* Felipe Henrique Moreira jales

---

## 📝 Histórias de Usuário

| ID | Ator | História de Usuário | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **HU01** | Cliente | Como **Cliente**, quero realizar o meu cadastro prévio informando RG, CPF, Nome, Endereço, Profissão e até 3 entidades empregadoras/rendimentos. | O sistema deve validar o limite máximo de 3 rendimentos e persistir os dados no `db.json` via `Fetch API`. |
| **HU02** | Cliente | Como **Cliente**, quero introduzir, consultar, modificar e cancelar pedidos de aluguel de automóveis pela Internet. | O pedido criado deve iniciar com status *"Em Análise Financeira"* e permitir edição ou cancelamento antes da execução. |
| **HU03** | Agente (Empresa/Banco) | Como **Agente**, quero analisar financeiramente os pedidos com base nos rendimentos do cliente e emitir parecer positivo ou negativo. | Apenas pedidos com parecer positivo ficam habilitados para execução do contrato. |
| **HU04** | Banco Agente | Como **Banco Agente**, quero associar um contrato de crédito ao pedido de aluguel quando solicitado pelo cliente. | O pedido deve registar o banco concessor, valor financiado, parcelas e taxa de juros. |
| **HU05** | Sistema / Agente | Como **Agente**, ao executar um contrato aprovado, quero registar a propriedade do automóvel (Cliente, Empresa ou Banco). | A propriedade da viatura na frota deve ser atualizada conforme o tipo de contrato executado. |

---

## 📐 Modelagem do Sistema (UML)

### 1. Diagrama de Casos de Uso
*(Copie o bloco Mermaid da secção 2.1 acima)*

### 2. Diagrama de Classes
*(Copie o bloco Mermaid da secção 2.2 acima)*

### 3. Diagrama de Pacotes (Visão Lógica)
*(Copie o bloco Mermaid da secção 2.3 acima)*

### 4. Diagrama de Componentes
*(Copie o bloco Mermaid da secção 2.4 acima)*

---

## 🔄 Evolução e Revisão dos Modelos ao Longo do Projeto

1. **Modelagem Inicial vs. Implementação do CRUD de Rendimentos:** Inicialmente, os rendimentos do cliente eram tratados como atributos simples na classe `Cliente`. Durante o desenvolvimento do formulário dinâmico em Bootstrap 5, o modelo foi refinado para uma relação de composição `1..3` com a classe `Rendimento`, facilitando a serialização em array JSON no `db.json`.
2. **Alinhamento entre Subsistema Web e Subsistema de Gestão:** A separação lógica em dois subsistemas refletiu-se diretamente no código (`app.js`), isolando a camada de comunicação HTTP (`apiFetch`) das funções de manipulação de DOM (`renderizar*`).

---

## 🚀 Como Executar o Projeto

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/sistema-aluguel-carros.git](https://github.com/SEU-USUARIO/sistema-aluguel-carros.git)
   cd sistema-aluguel-carros
   ```
2. Inicie a API REST simulada com o **JSON Server**:
   ```bash
   npx json-server@0.17.4 --watch db.json --port 3000
   ```
3. Abra o ficheiro `index.html` no navegador (ou utilize a extensão *Live Server* do VS Code).
