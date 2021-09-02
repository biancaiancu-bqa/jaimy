// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-mailosaur'
const userListPath = 'cypress/integration/usersBO.json'


Cypress.Commands.add('sendEmail', (serverId, emailAddress) => {
    cy.mailosaurSearchMessages(serverId, {
        sentTo: emailAddress
    }, {
        errorOnTimeout: false,
        // Set how long to poll for a result (in milliseconds)
        timeout: 120000,
        // This will make the search faster by only getting to most recent result
        itemsPerPage: 1
    }).then(result => {
        // If no items returned in time
        if (result.items.length === 0) {
            cy.log('No results were found')
            return null
        }
        // Result was found, go get the full message object
        return cy.mailosaurGetMessageById(result.items[0].id);
    })
})

Cypress.Commands.add('getEmailBySubject', (serverId, emailAddress, subject) => {
    cy.mailosaurSearchMessages(serverId, {
        sentTo: emailAddress,
        subject: subject
    }, {
        errorOnTimeout: false,
        // Set how long to poll for a result (in milliseconds)
        timeout: 240000,
        // This will make the search faster by only getting to most recent result
        itemsPerPage: 1
    }).then(result => {
        // If no items returned in time
        if (result.items.length === 0) {
            cy.log('No results were found')
            return null
        }
        // Result was found, go get the full message object
        return cy.mailosaurGetMessageById(result.items[0].id);
    })
})

Cypress.Commands.add('selectTrades', (trade) => {
    for(var i=0; i<trade.length; i++){
        if(trade[i].Category !=null){
            cy.get('[data-cy-list="trades-list"]').contains(trade[i].Category.toString()).parent().parent().parent().find('.MuiTreeItem-iconContainer').click()

            if(trade[i].Subcategories != null){
                cy.selectTrades(trade[i].Subcategories)
            }
        } 
        else {
            //no specific subcategories selected => all of them checked
            cy.get('[data-cy-list="trades-list"]').contains(trade[i].toString()).click() 
            //need to validate that all the subcategories are checked
        }
    }
})      

Cypress.Commands.add('validateTrades', (trade) => {
    for(var i=0; i<2; i++){
        if(trade[i].Category !=null){
            if(trade[i].Subcategories != null){
                cy.wait(200)

                cy.validateTrades(trade[i].Subcategories)
            }
        }
        else{
            cy.wait(1000)

            cy.log(trade[i].toString())
            cy.get('[data-cy-list="trades-list"]').contains(trade[i].toString()).parent().find('[data-cy="treeselect-checkbox"]').find('input[type="checkbox"]').should('have.attr', 'checked')

        }
    }
})

//headless authorization BO
//to be worked on
Cypress.Commands.add('loginToBo', (userAccount) => {
    cy.readFile(userListPath)
    .then(json => {
        let { username, password } = _.get(json, userAccount);
        cy.request({
            method: 'POST',
            url: 'https://auth.jaimystaging.be/api/users/login',
            headers: {
               'authorization': 'Bearer ' + 'eyJhbGciOiJIUzUxMiJ9.eyJ1dWlkIjoiYzYzMzU0ZmYtMjAzMi00N2M1LTljOGEtMWNkZDYxODdhMWVlIiwidHJhZGVyX2lkIjo5NDkxLCJob21lb3duZXJfaWQiOm51bGwsIm9wc19pZCI6MTY0LCJvcHNfcm9sZSI6InN1cGVyYWRtaW4iLCJsb2NhbGUiOiJmciIsInBlcm1pc3Npb25zIjpbeyJuYW1lIjoiY2F0ZWdvcnlfbGltaXQiLCJjYW4iOnRydWUsImxpbWl0IjoyfSx7Im5hbWUiOiJzZXJ2aWNlX3JhZGl1c19saW1pdCIsImNhbiI6dHJ1ZSwibGltaXQiOjUwfSx7Im5hbWUiOiJzaG93X2ludm9pY2VfbGF0ZXIiLCJjYW4iOmZhbHNlLCJsaW1pdCI6bnVsbH1dLCJzdWJzY3JpcHRpb24iOiJsb2NhbCIsImV4cCI6MTYyMDEzNDY3OSwiaXNzIjoiSmFpbXktQXV0aCIsImlhdCI6MTYyMDEyMDI3OX0.Gbs1eFgSMEQYw5gOmy5MIrOMUDkDhRaoTRU-fxGqPirIOul0_yf9WEMpwEgFdGXHbO_cK7Gxi2kaEXh7xr4OuQ'
            },
            body:{
                email: username.toString(),
                password: password.toString()
            }
        })
    })
})

