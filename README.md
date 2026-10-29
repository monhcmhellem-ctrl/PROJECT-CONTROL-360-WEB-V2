# PROJECT CONTROL 360 WEB V2

**Gestão de projetos, tarefas, riscos e indicadores em uma única aplicação.**

O PROJECT CONTROL 360 WEB V2 é uma aplicação web desenvolvida para centralizar o acompanhamento de projetos, organizar atividades, monitorar riscos e facilitar a visualização de indicadores operacionais em um dashboard integrado.

O projeto une conhecimentos de gestão de projetos, melhoria contínua e desenvolvimento web para transformar informações operacionais em uma visão mais clara do andamento das iniciativas.

## Acesse o sistema

- **Aplicação publicada:** https://monhcmhellem-ctrl.github.io/PROJECT-CONTROL-360-WEB-V2/
- **Repositório GitHub:** https://github.com/monhcmhellem-ctrl/PROJECT-CONTROL-360-WEB-V2

## Funcionalidades

- **Dashboard gerencial:** visão consolidada dos indicadores e do andamento dos projetos.
- **Gestão de projetos:** cadastro e acompanhamento de projetos.
- **Gestão de tarefas:** organização das atividades e acompanhamento de prazos e status.
- **Gestão de riscos:** registro e monitoramento de riscos.
- **Relatórios:** consulta às informações consolidadas para apoiar o acompanhamento gerencial.
- **Alertas operacionais:** identificação de tarefas atrasadas, prazos próximos e riscos críticos.
- **Persistência local:** armazenamento dos dados no navegador por meio do LocalStorage.

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- HTML5
- CSS3
- Git e GitHub
- GitHub Actions
- GitHub Pages
- LocalStorage

## Arquitetura e publicação

A aplicação foi estruturada em módulos independentes, integrados a um dashboard central.

O processo de publicação utiliza GitHub Actions para compilar a aplicação e realizar o deploy automático no GitHub Pages a partir da branch `main`.

## Como executar localmente

**Pré-requisitos:** Node.js e npm instalados.

1. Clone o repositório:

   ```bash
   git clone https://github.com/monhcmhellem-ctrl/PROJECT-CONTROL-360-WEB-V2.git
   ```

2. Entre na pasta do frontend:

   ```bash
   cd PROJECT-CONTROL-360-WEB-V2/frontend
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Para gerar a versão de produção:

   ```bash
   npm run build
   ```

## Observação sobre os dados

A versão atual utiliza LocalStorage para armazenar os dados no navegador. Por isso, as informações ficam restritas ao navegador e ao dispositivo utilizados, sem sincronização automática entre usuários.

## Objetivo do projeto

Demonstrar a aplicação de tecnologia ao gerenciamento de projetos e ao acompanhamento operacional, integrando organização de atividades, monitoramento de riscos e indicadores em uma solução web.

---

**Desenvolvido por Monique Marques**

Projeto de portfólio voltado à gestão de projetos, indicadores, organização operacional e desenvolvimento de soluções digitais.
