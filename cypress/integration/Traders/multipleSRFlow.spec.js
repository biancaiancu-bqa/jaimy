///<reference types="cypress"/>
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { paymentOp } from '../../support/Traders/paymentOperations'
import { jobOp} from '../../support/Traders/jobOperations'
import { bo } from '../../support/BO/operations'

let jobsNumber = 3

describe('Compensation flow', () => {

    ////////////////////////////////////
    ////////// MULTIPLE SR ////////////
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

    it('BO - Change status of the trader to Validated', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        bo.changeStatus('Validated')
        bo.validateTimeline('validated')
    })

    it('PRO - Login and add to cart multiple jobs', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('MarketingTrader', 'dynamic')
        jobOp.addToCartMultipleJobs(jobsNumber)

    })

    it('PAYMENT - Make the jobs payment', () => {
        paymentOp.paymentSR()
    })

    it('PRO - Validate that the jobs have been purchased', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})
        traderLoginPage.login('MarketingTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(jobsNumber)
    })
  
    it('BO - verify timeline events after buying the jobs', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validatePurchasedJobsUI(jobsNumber)
        bo.validateTimeline('multipleSR', 0, 1, jobsNumber)
        //bug - inside the timeline events, apart from the add to cart event, no other event is being shown

    })

    
})
