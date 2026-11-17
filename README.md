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

> **Nota sobre a Notação UML:** Os diagramas abaixo seguem estritamente a especificação **UML 2.5**, gerados a partir de código **PlantUML**.

### 1. Diagrama de Casos de Uso (UML)

![Diagrama de Casos de Uso UML](https://www.plantuml.com/plantuml/png/VPFFJXin4CRl-nIZdE0GcWtvarG8GGDKbLe95N7hPMGFsn5UExAz4T3sONhikO_0YzNhNGEnr3sjv_lcvz7CUiwSH-kRMXMAxZnu0vQhxnuaMnAUZIxSFUijMgnXY-8UAxhnZugWjL5NYee2XJSMHhUkUVvjsOm07OG0mpbv6yMaFKMhFoVhl6gZR_hWijvQSWZlu0DgOGvZSkUct6ZqMhIZK1HzDJZvEHwd-_V4T4_tYL9YNng1qONb7TqyEXZ33JjFDO8aE5TDrP1gZnkqrhWH_2W06aS2NQ1kDvCo45y95J-X3KaIdRS6hktpdrsQHqZAe6c0pXjFshC8c3OlHGy-cuhrOGAd6NWSm8zaIGiEt0LAuu12VIsv9ksDI-1n1iu2-4bxQsJpn1QkIR8qRrfCt2pZve7xOYJViS01R9vXYu1jZ7QDyaFO8iEMBOPQa1gYbXcrQgVfd8ap2LMzHH-vJVWBahr9u2e3rosuGyMlrQvOj_NPOZjFIkHwdomdWRny8D7uDoNZdwZOnPQjsLecYRA_8p3P7IMCquC9G7WEfdx-koC56k7A6ey9B3DmsWrNaAIXVaDYyUjrGSRZq-v55VsM9ANCXUDScEN2F1SMkR0iqi8b98iNMRpUZyj95fT54RSsnQ6Fk0z7HrrRy1vEJbWBrKWwFMszsO0t7_0M0zvom5l_toidoLjdNWkkeFDcqQC7JrfssBHtLXbr5ZAQMlq3)

**Código-fonte PlantUML:**
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
```

---

### 2. Diagrama de Classes (UML)

```mermaid
classDiagram
    class Cliente {
        +int id
        +String nome
        +String email
        +String senha
        +String rg
        +String cpf
        +String endereco
        +String profissao
        +cadastrar()
        +autenticar()
        +atualizar()
        +remover()
    }

    class Rendimento {
        +String entidadeEmpregadora
        +double valorRendimento
    }

    class Agente {
        +int id
        +String nome
        +String email
        +String senha
        +String tipo
        +String documento
        +autenticar()
        +avaliarPedido()
        +executarContrato()
    }

    class PedidoAluguel {
        +int id
        +String dataInicio
        +int dias
        +double valorTotal
        +String tipoPropriedade
        +boolean requerCredito
        +String status
        +String parecerAgente
    }

    class ContratoCredito {
        +int bancoId
        +double valorFinanciado
        +int parcelas
        +double taxaJuros
    }

    class Automovel {
        +int id
        +String matricula
        +int ano
        +String marca
        +String modelo
        +String placa
        +String proprietarioAtual
        +double diaria
    }

    Cliente "1" *-- "1..3" Rendimento : possui
    Cliente "1" --> "0..*" PedidoAluguel : realiza
    Agente "1" --> "0..*" PedidoAluguel : analisa
    PedidoAluguel "1" --> "1" Automovel : refere-se a
    PedidoAluguel "1" o-- "0..1" ContratoCredito : associa
```

---

### 3. Diagrama de Pacotes (UML — Organização Modular Real do Código)

![Diagrama de Pacotes UML](https://www.plantuml.com/plantuml/png/bPBBojim48NtUeeXgtHZxqi8ITr2ARs4E7HJib3jgQD45wEHUw7qQR8e5FeKVh7Adj3O_2RWbQqpEaSVCxEX87reZ1PqKRQMNXgePN6H5URXXqRuudI9NeYR28jjxP7G1jd-RgyEbXyLVYDuVNZtDito_Da2946dmKy1y4dP4hydfs3qiJiMMaKhtWLPZSy5KKhTmqdyEufVWuSpPuDtMfOk0a29yDAPzgzLaU5CQS5LZPwO8RiBZA9TfUnTJSuqH1eN66r2dm32ZcLR8943X3n-soipoIQS66OR_vY2ObqvEn5c6giAxcfivs47-rVvWNDgTOkfLTRZSjOfX9hFJ-9sw4bHQF_OGadOet51ml9D_k5z9FHVqNFWYtWVRSbnvUSOusmVD1mS9Cbwidtm75OhPMhdmtejniDbqqrwQ8kyOnSh3qrY0eVDWmQpfo4SmCrmo6g6uI7JS53JMFDCifhj4QCIN_y_SRxOxrmA_OvqgnTT6xHbO_G_)

**Código-fonte PlantUML:**
```plantuml
@startuml
skinparam packageStyle folder

package "Apresentação (Views HTML/CSS)" as View {
  [index.html]
  [cliente.html]
  [agente.html]
  [css/style.css]
}

package "Controladores de Domínio (js/controllers)" as Controllers {
  [loginController.js]
  [clienteController.js]
  [agenteController.js]
}

package "Controle de Acesso e Sessão (js/auth)" as Auth {
  [session.js]
}

package "Comunicação HTTP REST (js/api)" as ApiClient {
  [httpClient.js]
}

package "Persistência Remota (JSON Server)" as Backend {
  [db.json]
}

[index.html] ..> [loginController.js] : <<import>>
[cliente.html] ..> [clienteController.js] : <<import>>
[agente.html] ..> [agenteController.js] : <<import>>

[loginController.js] ..> [session.js] : <<use>>
[clienteController.js] ..> [session.js] : <<use>>
[agenteController.js] ..> [session.js] : <<use>>

[loginController.js] ..> [httpClient.js] : <<use>>
[clienteController.js] ..> [httpClient.js] : <<use>>
[agenteController.js] ..> [httpClient.js] : <<use>>

[httpClient.js] ..> [db.json] : <<HTTP / JSON REST>>
@enduml
```

---

### 4. Diagrama de Componentes (UML)

![Diagrama de Componentes UML](https://www.plantuml.com/plantuml/png/TP5DJpen4CRl_HHFE2tvix3_-6B2mV0YY4Hqmsxqe1xATfIQqfAsYoR6xswt6ENYQJhFFFERQMRWFBU-tYXMcStMQD8UhQarsgSJBL3aG_Img9MNQSvVw54dit9nVO9_61dZdRTyYoQR5ATO654hSkqMk4DaD8WF1ZpSINfpIAGMzDv1fMIOGnq4OeZjfyOo3dvhb2BhOZwi_He5EIUDncNDhOZoh2npZ2C0oPHyjSOmlmg8JyPaWDbdNX5QoqbHDWKaJKDlNjpUe7-KPTb-koKv7whiyDVHKv3TaSKkw_u_wnv7xzmPlPUPu9wlk0jyiUg-1ZqQBaQC_RaNqkHdsdT4UiZyVI9DpmCC_T301Ngujz8J6v0MuK1V)

**Código-fonte PlantUML:**
```plantuml
@startuml
component "Front-End SPA / Multi-Page\n(HTML5 + Bootstrap 5 + ES6 Modules)" as FrontEnd {
  [Views (index, cliente, agente)]
  [Controllers]
  [Auth Session Guard]
  [HTTP Client (Fetch API)]
}

interface "REST API (HTTP/JSON :3000)" as RestAPI

component "JSON Server v0.17.4" as JsonServer
database "db.json" as DB

[HTTP Client (Fetch API)] -( RestAPI
RestAPI - JsonServer
JsonServer --> DB : Read / Write
@enduml
```

---

## 🔄 Evolução e Revisão dos Modelos ao Longo do Projeto

1. **Autenticação e Controle de Acesso por Perfil:** Na versão inicial, todas as abas eram públicas. O sistema foi refatorado para separar as interfaces (`index.html`, `cliente.html` e `agente.html`), exigindo cadastro prévio e autenticação via `js/auth/session.js` antes de liberar operações específicas de cliente ou agente.
2. **Persistência Exclusiva via REST API:** O modo de contingência em `localStorage` foi removido de `js/api/httpClient.js` para garantir conformidade estrita com a persistência em servidor (`db.json` via `json-server`), exigindo que a API esteja ligada para o sistema funcionar.
3. **Modularização em Pacotes ES6:** O código monolítico único (`app.js`) foi dividido em camadas lógicas distintas (`js/api/`, `js/auth/` e `js/controllers/`), alinhando a implementação real do código à notion UML do Diagrama de Pacotes.

---

## 🚀 Como Executar o Projeto

1. Clone este repositório:
   ```bash
   git clone https://github.com/FelipehmJales/sistema-aluguel-carros.git
   cd sistema-aluguel-carros
   ```

2. Inicie a API REST simulada com o **JSON Server**:
   ```bash
   npx json-server@0.17.4 --watch db.json --port 3000
   ```
   *(Caso encontre erro de política de execução no PowerShell do Windows, utilize `npx.cmd json-server@0.17.4 --watch db.json --port 3000`)*.

3. Sirva o front-end através de um **servidor HTTP local**. Como o projeto utiliza Módulos ES6, abrir o arquivo com duplo clique bloqueia a execução. Use uma das opções abaixo:
   * **Opção 1:** Clique no botão **"Go Live"** da extensão *Live Server* no VS Code.
   * **Opção 2:** Execute o comando `npx serve .` (ou `npx.cmd serve .`) no terminal e abra o link `http://localhost:3000` no navegador.

### 🔑 Credenciais de Teste (`db.json`)
* **Perfil Cliente:** `carlos@email.com` | Senha: `123`
* **Perfil Agente (Empresa):** `contato@localiza.com` | Senha: `123`
* **Perfil Agente (Banco):** `credito@itau.com` | Senha: `123`
