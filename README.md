# 🐞 BugBank: Automação de Testes E2E com Cypress

Projeto de automação de testes end-to-end do **BugBank**, desenvolvido como desafio técnico final para a vaga (fictícia) de **Engenheiro(a) de Automação de Qualidade** da UniDiasTech.

O objetivo vai além de "scripts que passam": as regras de negócio foram levantadas, os cenários foram planejados a partir delas e os testes foram construídos para serem **resilientes**, sem esperas fixas.

---

## 🎯 Sistema alvo

| | |
|---|---|
| **Sistema** | BugBank: banco digital fictício criado para prática de testes |
| **URL** | https://bugbank.netlify.app |
| **Tipo** | Aplicação web (Next.js/React) sem backend: todos os dados ficam no `localStorage` do navegador |

**Por que o BugBank?** É um sistema com regras de negócio de domínio financeiro (saldo, transferências, extrato), validações de formulário e **bugs intencionais**. Isso permite exercitar a visão analítica de QA: questionar as regras, e não apenas automatizar o fluxo feliz.

---

## 🧰 Tecnologias

- [Cypress](https://www.cypress.io/) 15
- Mocha (nativo do Cypress): `describe`, `context`, `it`
- Node.js 20+

---

## 📋 Regras de negócio levantadas

### Funcionalidade 1: Cadastro de conta

| ID | Regra |
|---|---|
| RN01 | Os campos **E-mail**, **Senha** e **Confirmação de senha** são obrigatórios (mensagem: *"É campo obrigatório"*). |
| RN02 | O e-mail deve ter formato válido (mensagem: *"Formato inválido"*). |
| RN03 | Senha e confirmação de senha devem ser iguais (mensagem: *"As senhas não são iguais."*). |
| RN04 | Ao concluir o cadastro, o sistema gera um número de conta no formato `NNN-D` e exibe *"A conta NNN-D foi criada com sucesso"*. |
| RN05 | Se a opção **"Criar conta com saldo?"** estiver ativa, a conta começa com **R$ 1.000,00**; caso contrário, com **R$ 0,00**. |

### Funcionalidade 2: Login

| ID | Regra |
|---|---|
| RN06 | E-mail e senha são obrigatórios. |
| RN07 | Credenciais inválidas (usuário inexistente ou senha incorreta) exibem *"Usuário ou senha inválido."*, sem informar qual dos dois está errado (boa prática de segurança). |
| RN08 | Com login válido, o cliente é levado à **home**, que exibe nome, número da conta e saldo. |
| RN09 | O botão **Sair** encerra a sessão e retorna à tela de login. |

### Funcionalidade 3: Transferência e extrato

| ID | Regra |
|---|---|
| RN10 | A transferência é feita informando **número da conta**, **dígito**, **valor** e **descrição**. |
| RN11 | Uma transferência válida **debita** o valor do remetente e **credita** o valor no destinatário. |
| RN12 | Toda transferência fica registrada no **extrato**, com tipo, descrição e valor (negativo para o remetente). |
| RN13 | Não é permitido transferir para **a própria conta**. |
| RN14 | Não é permitido transferir para **conta inexistente**. |
| RN15 | Não é permitido transferir valor **maior que o saldo** disponível. |
| RN16 | Não é permitido transferir valor **igual a zero ou negativo**. |

---

## 🧪 Casos de teste

**Total: 18 testes** distribuídos em 3 funcionalidades.

### `cadastro.cy.js`

| ID | Cenário | Resultado esperado | RN |
|---|---|---|---|
| CT01 | Cadastrar conta com a opção "com saldo" ativa e fazer login | Modal *"A conta NNN-D foi criada com sucesso"*; home exibe saldo **R$ 1.000,00** | RN04, RN05 |
| CT02 | Cadastrar conta sem marcar a opção de saldo e fazer login | Home exibe saldo **R$ 0,00** | RN05 |
| CT03 | Enviar o formulário de cadastro vazio | *"É campo obrigatório"* em e-mail, senha e confirmação; nenhuma conta criada | RN01 |
| CT04 | Cadastrar com senha e confirmação diferentes | Modal *"As senhas não são iguais."* | RN03 |
| CT05 | Cadastrar com e-mail sem `@` | *"Formato inválido"* no campo e-mail; nenhuma conta criada | RN02 |

### `login.cy.js`

| ID | Cenário | Resultado esperado | RN |
|---|---|---|---|
| CT06 | Login com credenciais válidas | Redireciona para `/home` e exibe *"Olá {nome},"*, número da conta e saldo | RN08 |
| CT07 | Fazer login e clicar em **Sair** | Volta para a tela de login | RN09 |
| CT08 | Clicar em **Acessar** sem preencher nada | *"É campo obrigatório"* em e-mail e senha; permanece no login | RN06 |
| CT09 | Login com senha incorreta | Modal *"Usuário ou senha inválido."*; permanece no login | RN07 |
| CT10 | Login com usuário não cadastrado | Modal *"Usuário ou senha inválido."*; permanece no login | RN07 |

### `transferencia.cy.js`

Pré-condição: remetente com **R$ 1.000,00** e destinatário com **R$ 0,00**, logado como remetente.

| ID | Cenário | Resultado esperado | RN |
|---|---|---|---|
| CT11 | Transferir R$ 150 para conta válida | Modal *"Transferencia realizada com sucesso"*; saldo do remetente vai para **R$ 850,00** | RN10, RN11 |
| CT12 | Transferir R$ 150 e abrir o extrato | Extrato mostra saldo R$ 850,00, tipo *"Transferência enviada"*, descrição e valor **-R$ 150,00** | RN12 |
| CT13 | Transferir R$ 150 e logar como destinatário | Saldo do destinatário vai para **R$ 150,00** | RN11 |
| CT14 | Transferir para a própria conta | Modal *"Nao pode transferir pra mesmo conta"* | RN13 |
| CT15 | Transferir para conta `999-9` (inexistente) | Modal *"Conta inválida ou inexistente"* | RN14 |
| CT16 | Transferir R$ 1.000,01 (saldo + 1 centavo) | Modal *"Você não tem saldo suficiente para essa transação"*; saldo continua R$ 1.000,00 | RN15 |
| CT17 | Transferir R$ 0 | Modal *"Valor da transferência não pode ser 0 ou negativo"* | RN16 |
| CT18 | Transferir R$ -50 | Modal *"Valor da transferência não pode ser 0 ou negativo"* | RN16 |

> **Técnica aplicada:** o CT16 usa **análise de valor limite** (saldo + R$ 0,01), e o CT17/CT18 cobrem a fronteira do zero e um valor negativo.

---

## 🐛 Bugs e pontos de atenção encontrados

Durante o mapeamento exploratório, foram identificados os seguintes problemas no sistema:

| # | Tipo | Descrição | Severidade |
|---|---|---|---|
| B01 | Bug | Transferir com o **valor vazio** ou com **letras** exibe a mensagem técnica interna ``transferValue must be a `number` type, but the final value was: `NaN` `` em vez de uma mensagem amigável ao usuário. | Média |
| B02 | Regra questionável | O campo **Nome** não é obrigatório no cadastro, mas é usado na saudação da home (*"Olá {nome},"*). | Baixa |
| B03 | Texto | Erros de português nas mensagens: *"Nao pode transferir pra mesmo conta"* e *"Transferencia realizada com sucesso"* (faltam acentos, e "pra mesmo" deveria ser "para a mesma"). | Baixa |

> Os testes validam o comportamento **atual** do sistema (as mensagens exatamente como aparecem). Os bugs acima ficam documentados aqui como achados de QA para o time de desenvolvimento.

---

## 🛡️ Boas práticas aplicadas

- **Zero esperas fixas (`cy.wait(ms)`).** Toda sincronização usa o *retry* nativo do Cypress via asserções (`should('be.visible')`, `should('include', '/home')`, `should('not.exist')`).
- **Seletores estáveis.** O projeto prioriza `id` (`#textBalance`, `#modalText`, `#btnExit`) e o atributo `name` dos inputs, delimitados pelo container do formulário (`.card__login`, `.card__register`). Isso é necessário porque o BugBank renderiza os formulários de login e de cadastro **ao mesmo tempo** no HTML, com campos de mesmo `name`.
- **Massa de dados controlada.** Os usuários dos testes de login e de transferência são criados direto no `localStorage` (comando `cy.visitarComUsuarios`). Cada teste começa isolado e com saldo conhecido, sem depender da tela de cadastro, o que deixa os testes mais rápidos e menos frágeis.
- **Comandos customizados** (`cypress/support/commands.js`) evitam repetição e deixam os testes legíveis.
- **Fixtures** (`cypress/fixtures/usuarios.json`) separam os dados do código.
- **Asserção monetária robusta.** O BugBank formata valores com `Intl.NumberFormat`, que usa um espaço não-separável (` `) entre "R$" e o número. O comando `deveExibirValor` normaliza esse espaço sem perder o retry.

---

## 📁 Estrutura do projeto

```
bugbank-cypress/
├── cypress/
│   ├── e2e/
│   │   ├── cadastro/
│   │   │   └── cadastro.cy.js          # CT01 a CT05
│   │   ├── login/
│   │   │   └── login.cy.js             # CT06 a CT10
│   │   └── transferencia/
│   │       └── transferencia.cy.js     # CT11 a CT18
│   ├── fixtures/
│   │   └── usuarios.json               # massa de dados
│   └── support/
│       ├── commands.js                 # comandos customizados
│       └── e2e.js
├── cypress.config.js                   # baseUrl do BugBank
├── package.json
└── README.md
```

### Comandos customizados

| Comando | O que faz |
|---|---|
| `cy.visitarComUsuarios([usuarios])` | Cria os usuários no `localStorage` e abre a página inicial |
| `cy.cadastrar({ email, nome, senha, confirmacao, comSaldo })` | Preenche e envia o formulário de cadastro |
| `cy.login(email, senha)` | Faz login pela interface |
| `cy.transferir({ conta, digito, valor, descricao })` | Abre a tela de transferência e envia o formulário |
| `cy.validarModal(mensagem)` | Valida o texto do modal e o fecha |
| `.deveExibirValor('R$ 1.000,00')` | Valida um valor monetário exibido no elemento |

---

## ▶️ Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20 ou superior** (`node -v`)
- [Git](https://git-scm.com/)

### Instalação

```bash
git clone https://github.com/ClaraMaracaja/bugbank-cypress.git
cd bugbank-cypress
npm install
```

### Executar pela interface do Cypress (modo interativo)

```bash
npm run cy:open
```

Escolha **E2E Testing**, selecione um navegador e clique no arquivo de teste desejado.

### Executar em modo headless (terminal)

```bash
npm test
```

Para rodar apenas uma funcionalidade:

```bash
npx cypress run --spec "cypress/e2e/login/*.cy.js"
```

### Resultado esperado

```
  ✔  cadastro/cadastro.cy.js              5        5        -        -        -
  ✔  login/login.cy.js                    5        5        -        -        -
  ✔  transferencia/transferencia.cy.js    8        8        -        -        -
  ✔  All specs passed!                   18       18        -        -        -
```

---

## 🎥 Vídeo de demonstração

▶️ **[Assista ao pitch técnico](COLE_AQUI_O_LINK_DO_VIDEO)**

---

## 👩‍💻 Autoria

Desenvolvido por **[ClaraMaracaja](https://github.com/ClaraMaracaja)**, disciplina de Qualidade de Software.
