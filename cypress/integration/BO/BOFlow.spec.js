///<reference types="cypress"/>

import { bo } from '../../support/BO/operations'

//TRIED TO DO AN API LOGIN FOR BACKOFFICE
describe('Backoffice simple flow', () => {

    it('Login', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.login('bianca')
        // bo.publishJob()
    })

    it.only('Publish jobs', () => {
        cy.server()  
        cy.intercept('POST', 'https://auth.jaimystaging.be/api/users/login').as('login')
        cy.loginToBo('bianca')
        cy.wait(5000)
        bo.publishJob()
    })

    // it('Logout', () => {
    //     bo.logout()
    // })

    
})
