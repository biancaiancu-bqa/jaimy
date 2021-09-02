///<reference types="cypress"/>

import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { paymentOp } from '../../support/Traders/paymentOperations'
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { jobOp } from '../../support/Traders/jobOperations'

describe('Jobs list page', () => {

    it('Create user', () => { 
        cy.visit('/')
        traderRegistrationPage.registerTrader('localTrader')
    })
    it('Access confirmation email', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount('localTrader')
    })
     
    it.only('Add to cart', () => {
        cy.visit('/')
        traderLoginPage.login('DarkVader')
        jobOp.emptyCart()
        cy.wait(5000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')
    })

    it('Buy a job', () => {
        paymentOp.payment('localTrader', 'jobWithoutAnyCredit')
    })

    it('Payment validation', () => {
        cy.visit('/')
        // traderLoginPage.login('localTrader')
        paymentOp.paymentValidation('localTrader')
    })
})
