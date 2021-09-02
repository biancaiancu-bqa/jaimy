///<reference types="cypress"/>

import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { paymentOp } from '../../support/Traders/paymentOperations'
import { jobOp } from '../../support/Traders/jobOperations'
describe('Payment flows', () => {

    ////////////////////////////////////
    ///////////PROBATION///////////////
    //////////////////////////////////
    

    it('Login and add to cart job no.1 ', () => {
        cy.visit('/')
        traderLoginPage.login('DarkVader')
        jobOp.emptyCart()
        cy.wait(5000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payFromCart', 'payNow')
    })

    it('Buy job no.1', () => {
        paymentOp.payment('DarkVader', 'jobWithoutAnyCredit')
    })

    it('Login and add to cart job no.2 ', () => {
        cy.visit('/')
        traderLoginPage.login('DarkVader')
        jobOp.emptyCart()
        cy.wait(5000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payFromCart', 'payNow')
    })

    it('Buy job no.2', () => {
        paymentOp.payment('DarkVader', 'jobWithoutAnyCredit')
    })

   //more jobs to be added to buy
})
