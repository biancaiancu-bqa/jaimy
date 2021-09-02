///<reference types="cypress"/>
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { paymentOp } from '../../support/Traders/paymentOperations'
import { jobOp} from '../../support/Traders/jobOperations'
import { bo } from '../../support/BO/operations'
const jobData = 'cypress/support/Data/jobData.json'

let prepaidSum=100

describe('Compensation flow', () => {

    ////////////////////////////////////
    ///////////PREPAID CREDIT//////////
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

    //Backoffice - prepaid credit card
    it('BO - prepaid credit card', () => {
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

    it('PAYMENT - Get the payment link from email and pay the credit', () =>{
        paymentOp.prepaidCard('pay', prepaidSum)
    })

    //BUG - THE STATUS OF THE INVOICE APPEARS AS NOT PAID, BUT THE CREDIT IS VISIBLE IN THE ACCOUNT
    it('BO - verify the credit has been paid', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateCreditsUI(prepaidSum)

    })

    // Verify into the trader's account
    it('PRO - Login and verify the prepaid credit', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validateCredits(prepaidSum)
    })

    it('PRO - Buy a job with prepaid card and validate the remaining sum', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force:true})
        traderLoginPage.login('CompensationTrader', 'dynamic')
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')
        cy.wait(10000)
        cy.reload()
        jobOp.validateRemainingSum(prepaidSum)
        cy.wait(10000)
        cy.reload()    
        jobOp.validatePurchasedJob(1)
    })

    it('BO - verify timeline events', () => {
        cy.server()
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('CompensationTrader')
        bo.validateTimeline('creditPurchase', 0, 1)
        bo.validatePurchasedJobsUI(1)
        cy.readFile(jobData).then(json => {
            const jobPrice = json.jobPriceEuros
            bo.validateCreditsUI(prepaidSum-jobPrice)
        }) 

    })
})
