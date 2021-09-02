///<reference types="cypress"/>
import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { traderLoginPage } from '../../support/Traders/traderLoginPage'
import { jobOp} from '../../support/Traders/jobOperations'
import { bo } from '../../support/BO/operations'
const jobData = 'cypress/support/Data/jobData.json'

let marketingSum=100
describe('Compensation flow', () => {

    ////////////////////////////////////
    ///////////MARKETING//////////
    //////////////////////////////////

    afterEach(function() {
        if (this.currentTest.state === 'failed') {
          Cypress.runner.stop()
        }
    });
    
    it('Sign up', () => {  
        cy.server()
        cy.visit('/')
        traderRegistrationPage.registerTrader("MarketingTrader")
    })

     it('Access confirmation email', () => { 
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

    it('BO - marketing credits', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        bo.marketing(marketingSum)
        cy.wait(5000)
        bo.validateTimeline('marketing', marketingSum)
        bo.validateCreditsUI(marketingSum)

    })

    it('PRO - Login and verify the marketing credits', () =>{
        cy.visit('/')
        cy.wait(3000)
        traderLoginPage.login('MarketingTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()  
        jobOp.validateCredits(marketingSum)
    })

    it('PRO - Buy a job with prepaid card and validate the remaining sum', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force:true})
        traderLoginPage.login('MarketingTrader', 'dynamic')
        // payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater')
        cy.wait(10000)
        cy.reload()  
        jobOp.validateRemainingSum(marketingSum)
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(1)
    })

    it('BO - verify timeline', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        bo.searchForTrader('MarketingTrader')
        cy.wait(5000)
        bo.validateTimeline('creditPurchase',0,4)
        bo.validatePurchasedJobsUI(1)
        cy.readFile(jobData).then(json => {
            const jobPrice = json.jobPriceEuros
            bo.validateCreditsUI(marketingSum-jobPrice)
        }) 
    })
})
