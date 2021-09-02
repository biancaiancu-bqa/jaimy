///<reference types="cypress"/>
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { bo } from '../../support/BO/operations'
import { jobOp } from '../../support/Traders/jobOperations'
import { paymentOp} from '../../support/Traders/paymentOperations'
const paymentLink = 'cypress/support/Data/paymentLink.json'



let prepaidSum=110
let negativeSum=30

describe('Compensation flow', () => {
   
    ////////////////////////////////////
    /////////NEGATIVE INVOICE /////////
    //////////////////////////////////

    afterEach(function() {
        if (this.currentTest.state === 'failed') {
          Cypress.runner.stop()
        }
    });
    
    it('PRO - Sign up', () => {  
        cy.server()
        cy.visit('/')
        traderRegistrationPage.registerTrader("CompensationTrader")
    })

    it('PRO - Access confirmation email', () => { 
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

    it('BO - give prepaid credit and wait for the email to be sent', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.prepaid(prepaidSum)
        cy.wait(5000)
        bo.validateTimeline('prepaid', prepaidSum)
        paymentOp.waitForEmail('prepaidInvoice')
    })

    it('BO - negative invoice and wait for the email to be sent', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.negativeInvoice(negativeSum)
        bo.validateTimeline('negativeInvoice', negativeSum)
        paymentOp.waitForEmail('rectification')
    })

    it('PRO - get the payment link', () => {
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.getInvoiceLink()
    })

    it('PAYMENT - pay the invoice with the negative sum update', () => {
        cy.readFile(paymentLink).then(json => {
            const linkToPay = json.link
            cy.visit(linkToPay)
            paymentOp.payNegativeInvoice(prepaidSum, negativeSum)
        })
    })

    it('BO - verify the credit has been paid', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateCreditsUI(prepaidSum)
    })

    it('PRO - Login and verify the prepaid credit', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validateCredits(prepaidSum)
    })

})
