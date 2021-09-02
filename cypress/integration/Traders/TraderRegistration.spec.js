///<reference types="cypress"/>

import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'

describe('Create account and forget password flows', () => {
    afterEach(function() {
        if (this.currentTest.state === 'failed') {
          Cypress.runner.stop()
        }
    });
    
    it('Sign up', () => {  
        cy.server()
        cy.visit('/')
        traderRegistrationPage.registerTrader('newTrader')
    })

     it('Access confirmation email', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount('newTrader')
    })

    it('Forget password for the newly created trader', () => {
        cy.visit('/')
        traderRegistrationPage.forgetPassword('dynamic')   
     })
    

     it('Reset password for the newly created trader', () => {
         cy.server()
         traderRegistrationPage.resetPassword('dynamic')  
     })


})