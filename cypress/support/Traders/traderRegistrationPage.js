///<reference types="cypress"/>
import _ from "lodash";
import 'cypress-mailosaur'


const userListPath = 'cypress/integration/traders.json'
const dynamicTraderData = 'cypress/support/Data/traderData.json'
const serverId = 'vwd37fqh'
const serverDomain = 'vwd37fqh.mailosaur.net'

var currentDate = new Date()
var dynamicEmail = 'trader' + currentDate.getDate() + 
            + (currentDate.getMonth()+1)  + 
            + currentDate.getFullYear() +  
            + currentDate.getHours() +  
            + currentDate.getMinutes() + 
            + currentDate.getSeconds() + '@' + serverDomain
var activationLink
var passwordResetLink
var traderId
var forgetPasswordEmail

export class TraderRegistrationPage{

    /////////////////////////////////////////
    ////////////REGISTER TRADER/////////////
    ///////////////////////////////////////
    registerTrader(User){        
        //read the information from traders.json for the user that needs to be created
        cy.readFile(userListPath).then(json => {
            const { FirstName, LastName, Email, PhonePrefix, Phone} = _.get(json, User)
            if(Email.toString() != 'dynamic'){
                dynamicEmail = Email.toString()
            } 

            cy.intercept('POST', '**/traders/v1/traders/create').as('postTrader')

            //Sign in form
            cy.get('[data-cy="signinform"]').then(signInForm => {
                cy.wrap(signInForm).find('input[name="firstname"]').type(FirstName.toString())
                cy.wrap(signInForm).find('input[name="lastname"]').type(LastName.toString())
                cy.wrap(signInForm).find('input[name="email"]').type(dynamicEmail)
                cy.wrap(signInForm).find('input[name="email"]').get('[data-cy="test"]').click()

                //choose the french number
                switch(PhonePrefix.toString()){
                    case "NL":
                        cy.get('ul[role="listbox"]').get('li[data-value="+31"]').click()
                        break;
                    case "BE":
                        cy.get('ul[role="listbox"]').get('li[data-value="+32"]').click()
                        break;
                    case "FR":
                        cy.get('ul[role="listbox"]').get('li[data-value="+33"]').click()
                        break;
                    case "DE":
                        cy.get('ul[role="listbox"]').get('li[data-value="+49"]').click()
                        break;
                }
                cy.wrap(signInForm).find('input[name="phone"]').type(Phone.toString())
                cy.wrap(signInForm).find('label[data-cy="has_accepted"]').click()
                cy.wrap(signInForm).find('button[data-cy="submit"]').click()
            })
        

            // verify the request and responses
            cy.wait('@postTrader').then(xhr => {
                console.log(xhr)
                traderId = xhr.response.body.id
                //write the current email in traderData.json 
                cy.writeFile(dynamicTraderData, {dynamicCurrentEmail: dynamicEmail.toString(), traderId: traderId} )
                expect(xhr.state).to.equal('Complete')
                expect(xhr.request.body.firstname).to.equal(FirstName.toString())
                expect(xhr.request.body.lastname).to.equal(LastName.toString())
                expect(xhr.response.body.firstname).to.equal(FirstName.toString())
                expect(xhr.response.body.lastname).to.equal(LastName.toString())
                switch(PhonePrefix.toString()){
                    case "NL":
                        expect(xhr.request.body.phone).to.equal('+31' + Phone.toString())
                        expect(xhr.response.body.country).to.equal('NL')
                        expect(xhr.response.body.phone).to.equal('+31' + Phone.toString())
                        break;
                    case "BE":
                        expect(xhr.request.body.phone).to.equal('+32' + Phone.toString())
                        expect(xhr.response.body.country).to.equal('BE')
                        expect(xhr.response.body.phone).to.equal('+32' + Phone.toString())
                        break;
                    case "FR":
                        expect(xhr.request.body.phone).to.equal('+33' + Phone.toString())
                        expect(xhr.response.body.country).to.equal('FR')
                        expect(xhr.response.body.phone).to.equal('+33' + Phone.toString())
                        break;
                    case "DE":
                        expect(xhr.request.body.phone).to.equal('+49' + Phone.toString())
                        expect(xhr.response.body.country).to.equal('DE')
                        expect(xhr.response.body.phone).to.equal('+49' + Phone.toString())
                        break;
                }
            })

            cy.sendEmail(serverId, dynamicEmail)
            .then(email => {
            // No email sent in time, resend and recall the function
                 if (!email) {
                    cy.log('No emails found') 
                    cy.get('[data-cy="resend"]').click()
                    cy.sendEmail(serverId,dynamicEmail)
                    .then(emailResent => {
                        cy.log(emailResent.subject)
                        activationLink = emailResent.html.links[0].href
                        cy.log(activationLink + '/fr')
                    })
                } 
                //initial email sent in time
                else{
                    cy.log(email.subject)
                    activationLink = email.html.links[0].href
                    cy.log(activationLink + '/fr')
                }
            })
        })
    }
    
    ////////////////////////////////////////////
    //////////CONFIRM TRADER ACCOUNT///////////
    //////////////////////////////////////////
    confirmTraderAccount(User){

        cy.visit(activationLink)
        cy.intercept('GET', '**/traders/v1/traders/'+traderId).as('pageLoad')

        //read the information from traders.json for the user that needs to be created
        cy.readFile(userListPath).then(json => {
        const {FirstName, LastName, Email, PhonePrefix, Phone, Password, Trade, VAT, CompanyName, Street, Number, PostCode, City} = _.get(json, User)
        
            if(Email.toString() != 'dynamic'){
                dynamicEmail = Email.toString()
            }
            console.log(Trade)

            //////COMPLETE ACCOUNT CONFIRMATION//////
            //STEP 1
            cy.get('label[for="passwordField"]').find('[data-cy="password"]').type(Password.toString())
            cy.get('[data-cy="submit"]').click()

            //STEP 2
            cy.wait('@pageLoad')
            cy.contains('Aucune activité sélectionnée').click()
            //select the trades
            cy.selectTrades(Trade)

             if(Trade.length > 2){
                    cy.contains('Max 2 catégories')
                    cy.contains('Avec la version gratuite, vous êtes limité à 2 catégories principales')
            }
           
            cy.get('[data-cy-button="close_tree_view"]').click({force:true})
            cy.get('[data-cy="vat"]').type(VAT.toString())
            cy.get('[data-cy="companyname"]').type(CompanyName.toString())
            cy.get('[data-cy="submit"]').click()

            //STEP 3 
            cy.wait('@pageLoad')
            cy.get('[data-cy="street"]').type(Street.toString())
            cy.get('[data-cy="number"]').type(Number.toString())
            cy.get('[data-cy="postcode"]').type(PostCode.toString())
            cy.get('[data-cy="city"]').type(City.toString())
            cy.get('[data-cy="submit"]').click()

            //account confirmation
            cy.wait(7000)
            cy.wait('@pageLoad')
            cy.get('[data-cy="continue"]').click()


            ////// COMPLETE ACCOUNT FINALIZED//////
            //profile validation
            //response validation
            cy.wait('@pageLoad').then(xhr => {
                expect(xhr.state).to.equal('Complete')
                expect(xhr.response.body.address).to.equal(Street + ' ' + Number)
                expect(xhr.response.body.city).to.equal(City)
                expect(xhr.response.body.companyname).to.equal(CompanyName)
                expect(xhr.response.body.country).to.equal(PhonePrefix)
                expect(xhr.response.body.email).to.equal(dynamicEmail)
                expect(xhr.response.body.firstname).to.equal(FirstName)
                expect(xhr.response.body.lastname).to.equal(LastName)
                expect(xhr.response.body.radius_zip).to.equal(PostCode)
                

                switch(PhonePrefix.toString()){
                    case "NL":
                        expect(xhr.response.body.phone).to.equal('+31' + Phone.toString())
                        expect(xhr.response.body.vat_number).to.equal('BE'+VAT)
                        break;
                    case "BE":
                        expect(xhr.response.body.phone).to.equal('+32' + Phone.toString())
                        expect(xhr.response.body.vat_number).to.equal('BE'+VAT)
                        break;
                    case "FR":
                        expect(xhr.response.body.phone).to.equal('+33' + Phone.toString())
                        expect(xhr.response.body.vat_number).to.equal('BE'+VAT)
                        break;
                    case "DE":
                        expect(xhr.response.body.phone).to.equal('+49' + Phone.toString())
                        expect(xhr.response.body.vat_number).to.equal('BE'+VAT)
                        break;
                }


                //rules accept
                cy.get('label[for="hasAcceptedRules"]').find('#hasAcceptedRules').click()
                cy.get('[data-cy="submit"]').click()

                //finalization
                cy.get('[data-cy="continue"]').click()


                //UI validation
                cy.get('[data-cy="username"]').click()
                cy.get('[data-cy-menuitem="profile"]').click()
                cy.get('input[name="firstname"]').invoke('attr', 'value').should('contain', FirstName)
                cy.get('input[name="lastname"]').invoke('attr', 'value').should('contain', LastName)
                cy.get('input[name="zip"]').invoke('attr', 'value').should('contain', PostCode)
                cy.get('input[name="city"]').invoke('attr', 'value').should('contain', City)
                cy.get('input[name="address"]').invoke('attr', 'value').should('contain', Street)
                cy.get('input[name="companyname"]').invoke('attr', 'value').should('contain', CompanyName)
                cy.get('input[name="vat_number"]').invoke('attr', 'value').should('contain', VAT)
                cy.get('#mui-component-select-categories').click({ force: true })

                //trades list check boxes validation
                cy.validateTrades(Trade)
            })
               
        })

    }

    ////////////////////////////////////////////
    //////////////FORGET PASSWORD//////////////
    //////////////////////////////////////////

    forgetPassword(User){

        //define the email
        // it can be a trader which was just created (email in traderData.json)
        //or a trader that has already a confirmed account
        var path
        if (User === 'dynamic'){
            //dynamic
            path = dynamicTraderData
        } 
        else{
            //existing user
            path = userListPath
        }

        //read the dynamic email
        cy.readFile(path).then(json => {
            if(path == dynamicTraderData){
                //dynamic
                forgetPasswordEmail = json.dynamicCurrentEmail
            } else {
                //existing user
                const {Email}  = _.get(json, User)
                forgetPasswordEmail = Email
            }
            
            cy.contains('Connexion').click()
            cy.contains('Mot de passe oublié ?').click()
            cy.get('input[type="email"]').clear()
            cy.get('input[type="email"]').type(forgetPasswordEmail.toString())
            cy.contains('Réinitialiser').click()
            cy.wait(10000)
            
            //send the password reset email
            cy.sendEmail(serverId, forgetPasswordEmail)
            .then(email => {
                    // No email sent in time, resend and recall the function
                if (!email) {
                    cy.log('No emails found')    
                } 
                else{
                    cy.log(email.subject)
                    passwordResetLink = email.html.links[0].href
                    cy.log(passwordResetLink)
                }  
            })   
            
        })
    }

     ////////////////////////////////////////////
    //////////////RESET PASSWORD////////////////
    ///////////////////////////////////////////
    resetPassword(User){
        //define the email
        // it can be a trader which was just created (email in traderData.json)
        //or a trader that has already a confirmed account
        var path
        if (User === 'dynamic'){
            //dynamic
            path = dynamicTraderData
        } 
        else{
            //existing user
            path = userListPath
        }

        cy.intercept('PUT', 'https://auth.jaimystaging.be/auth/password').as('renewPassoword')
        cy.intercept('POST', 'https://auth.jaimystaging.be/api/users/login').as('accessProfile')


        cy.visit(passwordResetLink)
        cy.get('li[role="button"]').contains('FR').click()

        //One field completed with not enough characters
        cy.get('input[id="password"]').type('aaa')
        cy.get('button').contains('Valider').click()
        cy.contains('Veuillez remplir tous les champs requis')
        cy.contains('Doit être minimum 8 charactères')

        //One field completed with enough characters
        cy.get('input[id="password"]').clear()
        cy.get('input[id="password"]').type('123456789')
        cy.get('button').contains('Valider').click()
        cy.contains('Veuillez remplir tous les champs requis')
        cy.contains('Doit être minimum 8 charactères')

        //both fields completed, but different and with not enough characters  
        cy.get('input[id="password"]').clear()
        cy.get('input[id="password"]').type('123')
        cy.get('input[id="passwordConfirm"]').type('1234')
        cy.get('button').contains('Valider').click()
        cy.contains('Doit être minimum 8 charactères')

        //both fields completed, the same but with not enough characters 
        cy.get('input[id="password"]').clear()
        cy.get('input[id="passwordConfirm"]').clear()
        cy.get('input[id="password"]').type('123')
        cy.get('input[id="passwordConfirm"]').type('123')
        cy.get('button').contains('Valider').click()
        cy.contains('Doit être minimum 8 charactères')

        //both fields completed, different but with the same no. of characters
        cy.get('input[id="password"]').clear()
        cy.get('input[id="passwordConfirm"]').clear()
        cy.get('input[id="password"]').type('987654321')
        cy.get('input[id="passwordConfirm"]').type('123456789')
        cy.get('button').contains('Valider').click()
        cy.contains('Les mots de passe ne correspondent pas')

        //both fields completed, the same, with enough no. of characters
        cy.get('input[id="password"]').clear()
        cy.get('input[id="passwordConfirm"]').clear()
        cy.get('input[id="password"]').type('123456789')
        cy.get('input[id="passwordConfirm"]').type('123456789')
        cy.get('button').contains('Valider').click()

        cy.wait('@renewPassoword').then(xhr => {
            expect(xhr.state).to.equal('Complete')
        })

        //login with the new password
        cy.readFile(path).then(json => {
            if(path == dynamicTraderData){
                //dynamic
                forgetPasswordEmail = json.dynamicCurrentEmail

            } else {
                //existing
                const {Email}  = _.get(json, User)
                forgetPasswordEmail = Email
            }
            cy.get('input[id="username"]').type(forgetPasswordEmail.toString())
        })

        cy.get('input[id="password"]').type('123456789')
        cy.get('button').contains('Connexion').click()
        
        cy.wait('@accessProfile').then(xhr => {
            expect(xhr.state).to.equal('Complete')
        })
    }
}

export const traderRegistrationPage = new TraderRegistrationPage()