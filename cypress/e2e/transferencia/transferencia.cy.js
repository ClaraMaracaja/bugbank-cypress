/// <reference types="cypress" />

describe('Funcionalidade: Transferência entre contas', () => {
  let remetente
  let destinatario

  before(() => {
    cy.fixture('usuarios').then((dados) => {
      remetente = dados.comSaldo // R$ 1.000,00
      destinatario = dados.semSaldo // R$ 0,00
    })
  })

  beforeEach(() => {
    cy.visitarComUsuarios([remetente, destinatario])
    cy.login(remetente.email, remetente.senha)
    cy.url().should('include', '/home')
  })

  context('Transferência com sucesso', () => {
    it('CT11 - Deve transferir e debitar o valor do saldo do remetente', () => {
      cy.transferir({
        conta: destinatario.conta,
        digito: destinatario.digito,
        valor: '150',
        descricao: 'Aluguel',
      })

      cy.validarModal('Transferencia realizada com sucesso')

      cy.get('#btnBack').click()
      cy.get('#textBalance').deveExibirValor('R$ 850,00')
    })

    it('CT12 - Deve registrar a transferência no extrato do remetente', () => {
      cy.transferir({
        conta: destinatario.conta,
        digito: destinatario.digito,
        valor: '150',
        descricao: 'Aluguel',
      })
      cy.validarModal('Transferencia realizada com sucesso')

      cy.get('#btnBack').click()
      cy.get('#btn-EXTRATO').click()

      cy.url().should('include', '/bank-statement')
      cy.get('#textBalanceAvailable').deveExibirValor('R$ 850,00')
      cy.get('#textTypeTransaction').should('have.text', 'Transferência enviada')
      cy.get('#textDescription').should('have.text', 'Aluguel')
      cy.get('#textTransferValue').deveExibirValor('-R$ 150,00')
    })

    it('CT13 - Deve creditar o valor na conta do destinatário', () => {
      cy.transferir({
        conta: destinatario.conta,
        digito: destinatario.digito,
        valor: '150',
        descricao: 'Aluguel',
      })
      cy.validarModal('Transferencia realizada com sucesso')

      cy.get('#btnExit').click()
      cy.login(destinatario.email, destinatario.senha)

      cy.get('#textName').should('contain.text', destinatario.nome)
      cy.get('#textBalance').deveExibirValor('R$ 150,00')
    })
  })

  context('Regras de bloqueio', () => {
    it('CT14 - Não deve permitir transferência para a própria conta', () => {
      cy.transferir({ conta: remetente.conta, digito: remetente.digito, valor: '10', descricao: 'Teste' })

      cy.validarModal('Nao pode transferir pra mesmo conta')
    })

    it('CT15 - Não deve permitir transferência para conta inexistente', () => {
      cy.transferir({ conta: '999', digito: '9', valor: '10', descricao: 'Teste' })

      cy.validarModal('Conta inválida ou inexistente')
    })

    it('CT16 - Não deve permitir transferir valor maior que o saldo', () => {
      cy.transferir({
        conta: destinatario.conta,
        digito: destinatario.digito,
        valor: '1000.01',
        descricao: 'Acima do saldo',
      })

      cy.validarModal('Você não tem saldo suficiente para essa transação')
      cy.get('#btnBack').click()
      cy.get('#textBalance').deveExibirValor('R$ 1.000,00')
    })

    // mesma regra de negócio, valida os dois limites (zero e negativo)
    ;[
      { id: 'CT17', valor: '0' },
      { id: 'CT18', valor: '-50' },
    ].forEach(({ id, valor }) => {
      it(`${id} - Não deve permitir transferir valor igual a ${valor}`, () => {
        cy.transferir({ conta: destinatario.conta, digito: destinatario.digito, valor, descricao: 'Inválido' })

        cy.validarModal('Valor da transferência não pode ser 0 ou negativo')
      })
    })
  })
})
