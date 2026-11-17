// =============================================================
// Comandos customizados do projeto BugBank
// =============================================================

/**
 * Cria usuários direto no localStorage (o BugBank não tem backend:
 * tudo fica salvo na memória local do navegador) e abre a página inicial.
 * Assim cada teste começa com dados conhecidos, sem depender da tela de cadastro.
 *
 * @param {Array<Object>} usuarios - objetos vindos de cypress/fixtures/usuarios.json
 */
Cypress.Commands.add('visitarComUsuarios', (usuarios = []) => {
  cy.visit('/', {
    onBeforeLoad(win) {
      usuarios.forEach((u) => {
        win.localStorage.setItem(
          u.email,
          JSON.stringify({
            name: u.nome,
            email: u.email,
            password: u.senha,
            accountNumber: `${u.conta}-${u.digito}`,
            balance: u.saldo,
            logged: false,
          })
        )
        win.localStorage.setItem(`transaction:${u.email}`, JSON.stringify([]))
      })
    },
  })
})

/**
 * Preenche e envia o formulário de cadastro.
 * Campos não informados (undefined) são deixados em branco.
 */
Cypress.Commands.add('cadastrar', ({ email, nome, senha, confirmacao, comSaldo = false } = {}) => {
  cy.contains('button', 'Registrar').click()
  cy.get('.card__register').within(() => {
    // o formulário de cadastro aparece com uma animação de "virar o card";
    // os campos ficam sobrepostos durante a transição, por isso o force
    if (email) cy.get('input[name="email"]').type(email, { force: true })
    if (nome) cy.get('input[name="name"]').type(nome, { force: true })
    if (senha) cy.get('input[name="password"]').type(senha, { force: true })
    if (confirmacao) cy.get('input[name="passwordConfirmation"]').type(confirmacao, { force: true })
    if (comSaldo) cy.get('#toggleAddBalance').click({ force: true })
    cy.contains('button', 'Cadastrar').click({ force: true })
  })
})

/**
 * Faz login pela interface.
 */
Cypress.Commands.add('login', (email, senha) => {
  cy.get('.card__login').within(() => {
    if (email) cy.get('input[name="email"]').type(email)
    if (senha) cy.get('input[name="password"]').type(senha, { log: false })
    cy.contains('button', 'Acessar').click()
  })
})

/**
 * Abre a tela de transferência e preenche o formulário.
 */
Cypress.Commands.add('transferir', ({ conta, digito, valor, descricao } = {}) => {
  cy.get('#btn-TRANSFERÊNCIA').click()
  cy.url().should('include', '/transfer')
  if (conta) cy.get('input[name="accountNumber"]').type(conta)
  if (digito) cy.get('input[name="digit"]').type(digito)
  if (valor) cy.get('input[name="transferValue"]').type(valor)
  if (descricao) cy.get('input[name="description"]').type(descricao)
  cy.contains('button', 'Transferir agora').click()
})

/**
 * Valida o texto do modal de mensagens e o fecha.
 */
Cypress.Commands.add('validarModal', (mensagem) => {
  cy.get('#modalText').should('be.visible').and('contain.text', mensagem)
  cy.get('#btnCloseModal').click()
  cy.get('#modalText').should('not.exist')
})

/**
 * Valida um valor monetário exibido na tela.
 * O BugBank formata dinheiro com Intl.NumberFormat, que usa um espaço
 * não-separável (\u00A0) entre "R$" e o número. Normalizamos para espaço comum.
 * A asserção fica dentro de .should(callback), então mantém o retry do Cypress.
 *
 * Uso: cy.get('#textBalance').deveExibirValor('R$ 1.000,00')
 */
Cypress.Commands.add('deveExibirValor', { prevSubject: 'element' }, (elemento, valorEsperado) => {
  cy.wrap(elemento).should(($el) => {
    const texto = $el.text().replace(/\u00a0/g, ' ')
    expect(texto).to.contain(valorEsperado)
  })
})
