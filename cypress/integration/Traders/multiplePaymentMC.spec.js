///<reference types="cypress"/>
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { paymentOp } from '../../support/Traders/paymentOperations'
import { jobOp} from '../../support/Traders/jobOperations'
import { bo } from '../../support/BO/operations'

let marketingSum=2
describe('Compensation flow', () => {

       ///////////////////////////////////
      /////////Multiple payment//////////
     ////  CREDIT CARD + MARKETING  ////
    ///////////////////////////////////
    
    afterEach(function() {
        if (this.currentTest.state === 'failed') {
          Cypress.runner.stop()
        }
    });
    
    it('PRO - Sign up', () => {  
        cy.server()
        cy.visit('/')
        traderRegistrationPage.registerTrader("MarketingTrader")
    })

     it('PRO - Access confirmation email', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount("MarketingTrader")
    })

    it('BO - Change status of the trader', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        bo.changeStatus('Validated')
        bo.validateTimeline('validated')
    })

    it('BO - give marketing credits', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        bo.marketing(marketingSum)
        cy.wait(5000)
        bo.validateTimeline('marketing', marketingSum)
        bo.validateCreditsUI(marketingSum)

    })

    it('PRO - verify the marketing credits and add job to cart', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('MarketingTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validateCredits(marketingSum)
        cy.visit('/')
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')
    })

    it('PAYMENT - Buy the job with marketing credits and credit card', () => {
        //parameters for multiple payment 
        paymentOp.payment('MarketingTrader', 'multiple', marketingSum)
    })

    it('PRO - verify that the marketing credits are gone and the job is bought', () => {
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('MarketingTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(1)
        cy.wait(10000)
        cy.reload()
        jobOp.validateRemainingSum(marketingSum)
    })

    it('BO - verify timeline', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        cy.wait(5000)
        bo.validateTimeline('multiplePayments',0,6)
        bo.validatePurchasedJobsUI(1)
        bo.validateCreditsUI(0)

    })
})
