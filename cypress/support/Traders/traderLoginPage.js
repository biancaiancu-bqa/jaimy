///<reference types="cypress"/>
import _ from "lodash";
import 'cypress-mailosaur'

const userListPath = 'cypress/integration/traders.json'
const dynamicTraderData = 'cypress/support/Data/traderData.json'

export class TraderLoginPage{

    //////////////////////////////////////
    ////////////LOGIN TRADER/////////////
    ////////////////////////////////////
    login(User, type){
        cy.intercept('POST', 'https://auth.jaimystaging.be/api/users/login').as('accessProfile')

        cy.contains('Connexion').click()

        if(type =='dynamic'){
            cy.readFile(dynamicTraderData).then(json => {
                const Email = json.dynamicCurrentEmail 
                cy.readFile(userListPath).then(json => {
                    const { Password} = _.get(json, User)
                    cy.get('input[id="username"]').type(Email.toString())
                    cy.get('input[id="password"]').type(Password.toString())
                    cy.get('button').contains('Connexion').click()
                    cy.wait('@accessProfile')
                })   
            })
        } 
        else{
            cy.readFile(userListPath).then(json => {
                const {Email, Password} = _.get(json, User)
                cy.get('input[id="username"]').type(Email.toString())
                cy.get('input[id="password"]').type(Password.toString())
                cy.get('button').contains('Connexion').click()
                cy.wait('@accessProfile')
            })
        }   
    }
}

export const traderLoginPage = new TraderLoginPage()