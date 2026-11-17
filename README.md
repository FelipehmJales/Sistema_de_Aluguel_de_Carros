# Sistema de Aluguel de Carros (DriveSys)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap 5](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![JSON Server](https://img.shields.io/badge/JSON_Server-000000?style=for-the-badge&logo=json&logoColor=white)

> **Pontifícia Universidade Católica de Minas Gerais (PUC Minas)**  
> **Curso:** Ciências da Computação (2º Período - Manhã)  
> **Disciplina:** Desenvolvimento de Interfaces Web (DIW) — Laboratório 02  
> **Professor:** João Paulo Carneiro Aramuni  

---

## 📌 Descrição do Projeto

O **DriveSys** é um sistema web modular de apoio à gestão de aluguéis de automóveis que exige **cadastro prévio e autenticação por perfil** (`Cliente` ou `Agente`) antes de liberar o acesso às funcionalidades.

* **Clientes autenticados** podem introduzir, consultar, modificar e cancelar os seus próprios pedidos de aluguel, além de manter os seus dados cadastrais e até 3 entidades empregadoras/rendimentos.
* **Agentes autenticados (Empresas Locadoras e Bancos)** possuem portal exclusivo para avaliar financeiramente os pedidos com base nos rendimentos do cliente, emitir parecer positivo ou negativo, executar contratos aprovados (atualizando o registo de propriedade da viatura) e gerir a frota de automóveis.
* Toda a persistência de dados ocorre exclusivamente via API REST (`Fetch API` + `JSON Server` em `db.json`).

---

## 👥 Integrantes

* Felipe Henrique Moreira Jales

---

## 📝 Histórias de Usuário

| ID | Ator | História de Usuário | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **HU01** | Visitante / Cliente | Como **Visitante**, quero realizar o meu cadastro prévio (com e-mail, senha, RG, CPF, endereço, profissão e até 3 rendimentos) e efetuar login no sistema. | O sistema deve validar e-mail único, limitar a 3 rendimentos, persistir no `db.json` via `Fetch API` e restringir o acesso por perfil. |
| **HU02** | Cliente | Como **Cliente autenticado**, quero introduzir, consultar, modificar e cancelar os meus pedidos de aluguel de automóveis pela Internet. | O pedido inicia com status *"Em Análise Financeira"* e só permite edição ou cancelamento pelo próprio contratante antes da execução. |
| **HU03** | Agente (Empresa/Banco) | Como **Agente autenticado**, quero analisar financeiramente os pedidos com base nos rendimentos do cliente e emitir parecer positivo ou negativo. | Apenas utilizadores com perfil `AGENTE` acessam o painel de avaliação e aprovação financeira. |
| **HU04** | Banco Agente | Como **Banco Agente**, quero associar um contrato de crédito ao pedido de aluguel quando solicitado pelo cliente. | O pedido deve registar o banco concessor, valor financiado, número de parcelas e taxa de juros. |
| **HU05** | Agente | Como **Agente**, ao executar um contrato aprovado, quero registar a propriedade do automóvel (`Cliente`, `Empresa` ou `Banco`). | A propriedade da viatura na frota deve ser atualizada no `db.json` conforme o tipo de contrato executado. |

---

## 📐 Modelagem do Sistema (UML)

> **Nota sobre a Notação UML:** Os diagramas de Casos de Uso, Pacotes e Componentes abaixo seguem estritamente a especificação **UML 2.5** (utilizando atores, elipses de casos de uso com estereótipos `<<include>>` e `<<extend>>`, pacotes com dependências e componentes com interfaces), gerados a partir de código **PlantUML**.

### 1. Diagrama de Casos de Uso (UML)

![Diagrama de Casos de Uso UML](https://www.plantuml.com/plantuml/png/VPFFJXin4CRl-nIZdE0GcWtvarG8GGDKbLe95N7hPMGFsn5UExAz4T3sONhikO_0YzNhNGEnr3sjv_lcvz7CUiwSH-kRMXMAxZnu0vQhxnuaMnAUZIxSFUijMgnXY-8UAxhnZugWjL5NYee2XJSMHhUkUVvjsOm07OG0mpbv6yMaFKMhFoVhl6gZR_hWijvQSWZlu0DgOGvZSkUct6ZqMhIZK1HzDJZvEHwd-_V4T4_tYL9YNng1qONb7TqyEXZ33JjFDO8aE5TDrP1gZnkqrhWH_2W06aS2NQ1kDvCo45y95J-X3KaIdRS6hktpdrsQHqZAe6c0pXjFshC8c3OlHGy-cuhrOGAd6NWSm8zaIGiEt0LAuu12VIsv9ksDI-1n1iu2-4bxQsJpn1QkIR8qRrfCt2pZve7xOYJViS01R9vXYu1jZ7QDyaFO8iEMBOPQa1gYbXcrQgVfd8ap2LMzHH-vJVWBahr9u2e3rosuGyMlrQvOj_NPOZjFIkHwdomdWRny8D7uDoNZdwZOnPQjsLecYRA_8p3P7IMCquC9G7WEfdx-koC56k7A6ey9B3DmsWrNaAIXVaDYyUjrGSRZq-v55VsM9ANCXUDScEN2F1SMkR0iqi8b98iNMRpUZyj95fT54RSsnQ6Fk0z7HrrRy1vEJbWBrKWwFMszsO0t7_0M0zvom5l_toidoLjdNWkkeFDcqQC7JrfssBHtLXbr5ZAQMlq3)

<details>
<summary>Ver código-fonte PlantUML do Diagrama de Casos de Uso</summary>

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Usuário" as Usuario
actor "Cliente" as Cliente
actor "Agente\n(Empresa / Banco)" as Agente
actor "Banco Agente" as Banco

Usuario <|-- Cliente
Usuario <|-- Agente
Agente <|-- Banco

rectangle "DriveSys - Sistema de Aluguel de Carros" {
  usecase "UC01 - Realizar Cadastro Prévio" as UC01
  usecase "UC02 - Autenticar no Sistema (Login)" as UC02
  usecase "UC03 - Gerenciar Dados e Rendimentos" as UC03
  usecase "UC04 - Introduzir Pedido de Aluguel" as UC04
  usecase "UC05 - Modificar Pedido de Aluguel" as UC05
  usecase "UC06 - Consultar Pedido de Aluguel" as UC06
  usecase "UC07 - Cancelar Pedido de Aluguel" as UC07
  usecase "UC08 - Associar Contrato de Crédito" as UC08
  usecase "UC09 - Avaliar Pedido Financeiramente" as UC09
  usecase "UC10 - Executar Contrato e Registar Propriedade" as UC10
  usecase "UC11 - Cadastrar Automóvel na Frota" as UC11
  usecase "UC12 - Conceder Contrato de Crédito" as UC12
}

Usuario --> UC02

Cliente --> UC01
Cliente --> UC03
Cliente --> UC04
Cliente --> UC05
Cliente --> UC06
Cliente --> UC07

Agente --> UC05
Agente --> UC06
Agente --> UC09
Agente --> UC10
Agente --> UC11

Banco --> UC12

UC03 ..> UC02 : <<include>>
UC04 ..> UC02 : <<include>>
UC05 ..> UC02 : <<include>>
UC06 ..> UC02 : <<include>>
UC07 ..> UC02 : <<include>>
UC09 ..> UC02 : <<include>>
UC10 ..> UC09 : <<include>>

UC08 .> UC04 : <<extend>>
UC12 .> UC08 : <<include>>
@enduml
