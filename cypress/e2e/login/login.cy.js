/// <reference types="cypress" />

describe('Funcionalidade: Login', () => {
  let usuarios

  before(() => {
    cy.fixture('usuarios').then((dados) => {
      usuarios = dados
    })
  })

  beforeEach(() => {
    cy.visitarComUsuarios([usuarios.comSaldo])
  })

  context('Login com sucesso', () => {
    it('CT06 - Deve acessar a home e exibir nome, conta e saldo do cliente', () => {
      const { nome, email, senha, conta, digito } = usuarios.comSaldo

      cy.login(email, senha)

      cy.url().should('include', '/home')
      cy.get('#textName').should('have.text', `Olá ${nome},`)
      cy.get('#textAccountNumber').should('contain.text', `${conta}-${digito}`)
      cy.get('#textBalance').deveExibirValor('R$ 1.000,00')
    })

    it('CT07 - Deve sair da conta e voltar para a tela de login', () => {
      const { email, senha } = usuarios.comSaldo

      cy.login(email, senha)
      cy.url().should('include', '/home')

      cy.get('#btnExit').click()

      cy.url().should('not.include', '/home')
      cy.get('.card__login').contains('button', 'Acessar').should('be.visible')
    })
  })

  context('Login inválido', () => {
    it('CT08 - Deve exigir e-mail e senha', () => {
      cy.login()

      cy.get('.card__login').within(() => {
        cy.get('input[name="email"]').siblings('.input__warging').should('have.text', 'É campo obrigatório')
        cy.get('input[name="password"]').siblings('.input__warging').should('have.text', 'É campo obrigatório')
      })
      cy.url().should('not.include', '/home')
    })

    it('CT09 - Não deve logar com senha incorreta', () => {
      cy.login(usuarios.comSaldo.email, 'senhaErrada')

      cy.validarModal('Usuário ou senha inválido.')
      cy.url().should('not.include', '/home')
    })

    it('CT10 - Não deve logar com usuário não cadastrado', () => {
      cy.login('naoexiste@bugbank.com', 'qualquer123')

      cy.validarModal('Usuário ou senha inválido.')
      cy.url().should('not.include', '/home')
    })
  })
})
