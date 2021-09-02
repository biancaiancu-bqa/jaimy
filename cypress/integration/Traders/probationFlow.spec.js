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
    /////////// PROBATION /////////////
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
    })

    it('PRO - Add to cart the first job ', () => {
        cy.visit('/')
        traderLoginPage.login('CompensationTrader', 'dynamic')
        

        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
    })

    it('PAYMENT - 1st job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    
    it('PRO - Check the 1st job is bought and add to cart the 2nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(1)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 2nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 2nd job is bought and add to cart the second job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(2)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 3rd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 3rd job is bought and add to cart the 4nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(3)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 4rd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 4rd job is bought and add to cart the 5nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(4)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 5nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 5nd job is bought and add to cart the 6nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(5)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 6nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 6nd job is bought and add to cart the 7nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(6)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 7nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 7nd job is bought and add to cart the 8nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(7)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 8nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 8nd job is bought and add to cart the 9nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(8)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 9nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 9nd job is bought and add to cart the 10nd job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(9)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT -10nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    it('PRO - Check the 10nd job is bought and add to cart the 11th job', () => {
        cy.visit('/')
        cy.get('li[role="button"]').contains('FR').click({force: true})

        traderLoginPage.login('CompensationTrader', 'dynamic')
        cy.wait(10000)
        cy.reload()
        jobOp.validatePurchasedJob(10)

        cy.wait(2000)
        //payDirect/payFromCart or invoiceLater/payNow
        jobOp.addToCart('payDirect','invoiceLater', 40)
        // cy.reload()

    })

    it('PAYMENT - 10nd job', () => {
        paymentOp.payment('CompensationTrader', 'jobWithoutAnyCredit')
    })

    //the trader shouldnt be able to buy more than 3 jobs


})
