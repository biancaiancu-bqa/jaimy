///<reference types="cypress"/>


import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { bo } from '../../support/BO/operations'
import { paymentOp} from '../../support/Traders/paymentOperations'
import { jobOp} from '../../support/Traders/jobOperations'

const jobData = 'cypress/support/Data/jobData.json'
const compensationSum = 100

describe('Compensation flow', () => {
    ////////////////////////////////////
    ///////////COMPENSATION////////////
    //////////////////////////////////

    afterEach(function() {
        if (this.currentTest.state === 'failed') {
          Cypress.runner.stop()
        }
    });
      
    it('BO - Sign up', () => {  
        cy.server()
        cy.visit('/')
        traderRegistrationPage.registerTrader("CompensationTrader")
    })

     it('BO - Access confirmation email', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount("CompensationTrader")
    }) 

    it('BO -Change status of the trader', () => {
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
        cy.wait(5000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')
    })

    it('PAYMENT - Buy a job and get job number', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('BO - timeline validation after buying the job ', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateTimeline('jobWithCreditCard')
        bo.validatePurchasedJobsUI(1)
    })
    it('BO - give compensation for a specific job', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        cy.readFile(jobData).then(json => {
            const jobRef = json.jobRef
            bo.compensation(jobRef, compensationSum)
            bo.validateTimeline('compensation', compensationSum)
        }) 
        bo.validateCreditsUI(compensationSum)
    })

    it('PRO - Login and verify the compensation', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validateCredits(compensationSum)
    })
    it('PAYMENT - Buy a job with compensation credit and validate the remaining sum', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(5000)

        //the buy is being bought without needing to access the payment page
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(2)
        cy.reload()
        cy.wait(10000)
        jobOp.validateRemainingSum(compensationSum)
    })

    it('BO - verify timeline events', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateTimeline('creditPurchase', 0, 4)
        bo.validateEventsNumber(8)
        bo.validatePurchasedJobsUI(2)
        cy.readFile(jobData).then(json => {
            const jobPrice = json.jobPriceEuros
            bo.validateCreditsUI(compensationSum-jobPrice)
        }) 

    })

})
