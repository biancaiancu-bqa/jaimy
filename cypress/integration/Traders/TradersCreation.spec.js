///<reference types="cypress"/>

import { traderRegistrationPage } from '../../support/Traders/traderRegistrationPage'
import { bo } from '../../support/BO/operations'

describe('Persona traders creation', () => {

    ////////////////////////////////////////////
    //////////////DARK VADER///////////////////
    //////////////PROBATION///////////////////
    it('Create user Dark Vader', () => { 
        cy.server()
        cy.visit('/')
        traderRegistrationPage.registerTrader('DarkVader')

    })
    it('Access confirmation email Dark Vader', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount('DarkVader')
    })

    it.only('Change status of Dark Vader to probation', () => {
        cy.visit('https://bo.jaimystaging.be/')
        bo.logout()

        bo.login('bianca')
        bo.changeStatus('Validated')

    })

    ////////////////////////////////////////////
    //////////////IRON MAN//////////////////////
    ///////////////////////////////////////////
    it('Create user Iron Man', () => { 
        cy.visit('/')
        traderRegistrationPage.registerTrader('IronMan')

    })
    it('Access confirmation email Iron Man', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount('IronMan')
    })

    ////////////////////////////////////////////
    //////////////CAPTAIN AMERICA///////////////
    ///////////////////////////////////////////
    it('Create user Captain America', () => { 
        cy.visit('/')
        traderRegistrationPage.registerTrader('CaptainAmerica')

    })
    it('Access confirmation email Captain America', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount('CaptainAmerica')
    })

    ////////////////////////////////////////////
    //////////////BLACK WIDOW//////////////////
    ///////////////////////////////////////////
    it('Create user Black Widow', () => { 
        cy.visit('/')
        traderRegistrationPage.registerTrader('BlackWidow')

    })
    it('Access confirmation email Black Widow', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount('BlackWidow')
    })

    ////////////////////////////////////////////
    //////////////SPIDER MAN///////////////////
    ///////////////////////////////////////////
    it('Create user Spider Man', () => { 
        cy.visit('/')
        traderRegistrationPage.registerTrader('SpiderMan')

    })
    it('Access confirmation email Spider Man', () => { 
        cy.server()
        traderRegistrationPage.confirmTraderAccount('SpiderMan')
    })

     
})
