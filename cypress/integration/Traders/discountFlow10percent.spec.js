///<reference types="cypress"/>
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { paymentOp } from '../../support/Traders/paymentOperations'
import { jobOp} from '../../support/Traders/jobOperations'
import { bo } from '../../support/BO/operations'

let discountPercent=10
let maxJobPrice = 40 

describe('Compensation flow', () => {

    ////////////////////////////////////
    ///// MARKETING DISCOUNT - 10 /////
    //////////////////////////////////
    
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
        bo.changeStatus( 'Validated')
        bo.validateTimeline('validated')
    })

    it('BO - marketing credits', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        bo.discount(discountPercent)
        bo.validateTimeline('discount', 10)
    })

    it('PRO - Login and verify the discount credit on Pro', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('MarketingTrader', 'dynamic')
        // payDirect/payFromCart or invoiceLater/payNow, maxPrice and discount
        jobOp.addToCart('payFromCart','invoiceLater', maxJobPrice, discountPercent)
    })

    it('PAYMENT - Buy the job', () => {
        paymentOp.payment('MarketingTrader', 'payWithDiscount', discountPercent)
    })

    it('PRO - Validate that the job has been purchased', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})
        traderLoginPage.login('MarketingTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(1)
    })

   //ATTENTION - PRESENT BUG
    it('BO - verify timeline events', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validatePurchasedJobsUI(1)

        //bug - inside the timeline events, apart from the add to cart event, no other event is being shown

    })

    
})
