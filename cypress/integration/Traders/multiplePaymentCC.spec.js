///<reference types="cypress"/>

import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { bo } from '../../support/BO/operations'
import { jobOp} from '../../support/Traders/jobOperations'
import { paymentOp} from '../../support/Traders/paymentOperations'

const jobData = 'cypress/support/Data/jobData.json'
const compensationSum = 2

describe('Compensation flow', () => {
       ///////////////////////////////////
      /////////Multiple payment//////////
     ///  CREDIT CARD + COMPENSATION  //
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

    it('PRO - Add to cart', () => {
        cy.visit('/')
        traderLoginPage.login('CompensationTrader', 'dynamic')
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')
    })

    it('PAYMENT - Buy a job and get job number', () => {
        //simple payment 
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('BO - give compensation for a specific job', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateTimeline('job')
        bo.validatePurchasedJobsUI(1)
        cy.readFile(jobData).then(json => {
            const jobRef = json.jobRef
            bo.compensation(jobRef, compensationSum)
        })
    })

    it('BO - verify the timeline for the compensation credit', () =>{
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateCreditsUI(compensationSum)
        bo.validateTimeline('compensation', compensationSum)
    })

    it('PRO - Verify the compensation and add job to cart', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validateCredits(compensationSum)
        cy.visit('/')
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')

    })

    it('PAYMENT - Buy the job with compensation and credit card', () => {
        //parameters for multiple payment 
        paymentOp.payment('CompensationTrader', 'multiple', compensationSum)
    })

    it('PRO - verify that the prepaid credits are gone and the job is bought', () => {
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(2)
        cy.wait(10000)
        cy.reload()
        jobOp.validateRemainingSum(compensationSum)
    
    })

    it('BO - verify timeline after buying the job with both marketing credits and credit card', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        cy.wait(5000)
        bo.validateTimeline('multiplePayments',0,7)
        bo.validatePurchasedJobsUI(2)
        bo.validateCreditsUI(0) 
    })

})
