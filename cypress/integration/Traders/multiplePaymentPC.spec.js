///<reference types="cypress"/>
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { paymentOp } from '../../support/Traders/paymentOperations'
import { jobOp} from '../../support/Traders/jobOperations'
import { bo } from '../../support/BO/operations'

let prepaidSum=2

describe('Compensation flow', () => {

       ///////////////////////////////////
      /////////Multiple payment//////////
     ////  CREDIT CARD + PREPAID  //////
    ///////////////////////////////////
    
    afterEach(function() {
        if (this.currentTest.state === 'failed') {
          Cypress.runner.stop()
        }
    });
    
    it('Pro - Sign up', () => {  
        cy.server()
        cy.visit('/')
        traderRegistrationPage.registerTrader("CompensationTrader")
    })

     it('Pro - Access confirmation email', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount("CompensationTrader")
    })

    it('BO - Change status of the trader', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.changeStatus( 'Validated')
        bo.validateTimeline('validated')
    })

    it('BO -  give prepaid credits', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.prepaid(prepaidSum)
        cy.wait(5000)
        bo.validateTimeline('prepaid', prepaidSum)
    })

    it('PRO - verify that the prepaid credits is not available in the traders account yet', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force:true})
        traderLoginPage.login('CompensationTrader', 'dynamic')
        jobOp.validateTheAbsenceOfCredit()
    })

    it('PAYMENT - Get the payment link from email and pay the prepaid credit', () =>{
        paymentOp.prepaidCard('pay', prepaidSum)
    })

    //THE STATUS OF THE INVOICE APPEARS AS NOT PAID, BUT THE CREDIT IS VISIBLE IN THE ACCOUNT
    //BUG - NOT WORKING ATM
    it('BO - verify the credit has been paid', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateCreditsUI(prepaidSum)
    })

    it('PRO - Verify the prepaid card credits and add to cart', () =>{
        cy.visit('/')
        cy.wait(3000)
        cy.get('li[role="button"]').contains('FR').click({force:true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validateCredits(prepaidSum)
        cy.visit('/')
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')

    })

    it('PAYMENT - Buy the job with prepaid credit and credit card', () => {
        //parameters for multiple payment 
        paymentOp.payment('CompensationTrader', 'multiple', prepaidSum)
    })

    it('PRO - verify that the prepaid credits are gone and the job is bought', () => {
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(1)
        cy.wait(10000)
        cy.reload()
        jobOp.validateRemainingSum(prepaidSum)
    })

    it('BO - verify timeline events', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateTimeline('multiplePayments',0,6)
        bo.validatePurchasedJobsUI(1)
        bo.validateCreditsUI(0) 
    })
})
