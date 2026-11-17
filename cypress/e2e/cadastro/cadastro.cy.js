/// <reference types="cypress" />

describe('Funcionalidade: Cadastro de conta', () => {
  let usuarios

  before(() => {
    cy.fixture('usuarios').then((dados) => {
      usuarios = dados
    })
  })

  beforeEach(() => {
    cy.visit('/')
  })

  context('Cadastro com sucesso', () => {
    it('CT01 - Deve criar conta COM saldo inicial de R$ 1.000,00', () => {
      const { nome, email, senha } = usuarios.novo

      cy.cadastrar({ email, nome, senha, confirmacao: senha, comSaldo: true })

      cy.get('#modalText')
        .should('be.visible')
        .invoke('text')
        .should('match', /A conta \d+-\d foi criada com sucesso/)
      cy.get('#btnCloseModal').click()

      cy.login(email, senha)
      cy.url().should('include', '/home')
      cy.get('#textName').should('contain.text', `Olá ${nome}`)
      cy.get('#textBalance').deveExibirValor('R$ 1.000,00')
    })

    it('CT02 - Deve criar conta SEM saldo quando a opção não é marcada', () => {
      const { nome, email, senha } = usuarios.novo

      cy.cadastrar({ email, nome, senha, confirmacao: senha })
      cy.validarModal('foi criada com sucesso')

      cy.login(email, senha)
      cy.get('#textBalance').deveExibirValor('R$ 0,00')
    })
  })

  context('Validações do formulário', () => {
    it('CT03 - Deve exigir e-mail, senha e confirmação de senha', () => {
      cy.cadastrar({})

      cy.get('.card__register').within(() => {
        cy.get('input[name="email"]').siblings('.input__warging').should('have.text', 'É campo obrigatório')
        cy.get('input[name="password"]').siblings('.input__warging').should('have.text', 'É campo obrigatório')
        cy.get('input[name="passwordConfirmation"]')
          .siblings('.input__warging')
          .should('have.text', 'É campo obrigatório')
      })
      cy.get('#modalText').should('not.exist')
    })

    it('CT04 - Não deve cadastrar quando as senhas forem diferentes', () => {
      const { nome, email } = usuarios.novo

      cy.cadastrar({ email, nome, senha: 'senha123', confirmacao: 'outraSenha' })

      cy.validarModal('As senhas não são iguais.')
    })

    it('CT05 - Não deve aceitar e-mail em formato inválido', () => {
      const { nome, senha } = usuarios.novo

      cy.cadastrar({ email: 'email-sem-arroba', nome, senha, confirmacao: senha })

      cy.get('.card__register input[name="email"]')
        .siblings('.input__warging')
        .should('have.text', 'Formato inválido')
      cy.get('#modalText').should('not.exist')
    })
  })
})
