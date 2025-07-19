# Gerência Patrimonial V2 Frontend

Este é o repositório do frontend da aplicação **Gerência Patrimonial V2**, uma interface de usuário moderna e responsiva para o sistema de gestão de patrimônio empresarial. A aplicação foi construída com Next.js e TypeScript, utilizando o App Router para uma navegação rápida e otimizada.

[Link para a aplicação](https://gerencia-patrimonial.vercel.app/)

[Link para documentação da API](https://gerencia-patrimonial-api.onrender.com/api/schema/swagger-ui/)

[Link para documentação dos artefatos](https://joao-artl.github.io/Gerencia_Patrimonial_V2/)

[Link para o repositório do Back-End](https://github.com/joao-artl/Gerencia_Patrimonial_V2)

## ✨ Funcionalidades da Interface

* **Fluxo de Autenticação Completo:** Telas de Login e Cadastro que se comunicam com a API para autenticação via JWT.
* **Dashboard do Gestor:** Visão geral da empresa, com acesso ao gerenciamento de filiais e funcionários.
* **Interfaces de CRUD:** Modais e formulários para criar, editar e deletar Empresas, Filiais e Patrimônios.
* **Busca e Filtros Dinâmicos:** Todos os dados são carregados da API e podem ser filtrados e pesquisados em tempo real.
* **Design Responsivo:** A interface se adapta a diferentes tamanhos de tela, de desktops a dispositivos móveis.

## 🛠️ Tecnologias Utilizadas

* **Framework:** Next.js 14+ (com App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS
* **Componentes de UI:** shadcn/ui
* **Comunicação com API:** Axios
* **Testes E2E:** Selenium com Pytest
* **Hospedagem:** Vercel

## 🚀 Como Rodar Localmente

1.  **Pré-requisitos:**
    * A **API do backend** deve estar rodando (localmente via Docker ou no deploy do Render).
    * [Node.js](https://nodejs.org/)
    * [pnpm](https://pnpm.io/installation)
    * [Docker](https://www.docker.com/products/docker-desktop/)
    * [Docker Compose](https://docs.docker.com/compose/install/)

2.  **Clone o repositório:**
    ```bash
    git clone https://github.com/joao-artl/Gerencia_Patrimonial_V2_Front_End.git
    cd Gerencia_Patrimonial_V2_Front_End/
    ```

3.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

4.  **Crie o arquivo de ambiente:**
    * Crie um arquivo `.env.local` na raiz do projeto.
    * Adicione a variável de ambiente apontando para a sua API:
        ```
        NEXT_PUBLIC_API_URL=http://localhost:8000/api
        ```

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    docker-compose up --build
    ```
    A aplicação estará disponível em `http://localhost:3000`.

6.  **Para parar os containers:**
    ```bash
    docker compose down -v
    ```


### Testes Automatizados de Interface

Este projeto contém testes End-to-End (E2E) com Selenium para validar o fluxo do usuário.

1.  **Instale as dependências de teste (Python):**
    ```bash
    # (Opcional) Crie um ambiente virtual
    python3 -m venv venv-tests
    source venv-tests/bin/activate
    
    pip install -r tests/requirements.txt
    ```

2.  **Execute os testes:**
    * Garanta que tanto o backend quanto o frontend estejam rodando localmente.
    * Execute o Pytest:
        ```bash
        pytest tests/test_fluxo_completo.py
        ```