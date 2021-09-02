///<reference types="cypress"/>
import _ from "lodash";
import 'cypress-mailosaur'

const userListPath = 'cypress/integration/traders.json'
const jobData = 'cypress/support/Data/jobData.json'
const dynamicTraderData = 'cypress/support/Data/traderData.json'
const paymentLink = 'cypress/support/Data/paymentLink.json'

const serverId = 'vwd37fqh'
var linkToPay
var emailContent
var linkToPay
var userEmail

export class paymentOperations{
    
    payment(User, type, credit, negativeSum){
        cy.readFile(paymentLink).then(json => {
            linkToPay = json.link
            cy.visit(linkToPay)

            if(type === 'multiple'){
                
                paymentOp.validatePriceForMultiplePayment(credit)
            } else {
                if (type=='payWithDiscount'){
                    paymentOp.validatePriceWithDiscount(credit)
                }
                // else if(type=='payWithNegativeInvoice'){
                //     paymentOp.validatePriceWithNegativeInvoice(credit, negativeSum)
                // }
                else{
                    cy.readFile(jobData).then(json => {
                        const sum = parseFloat(json.jobPriceEuros)
                        paymentOp.validatePrice(sum)
                    })

                }

            }

            cy.contains('Bancontact').click()
            cy.wait(1000)
            cy.contains('Payé').click()
            cy.wait(1000)
            cy.contains('Continuer').click()

            //validate that the trader has received the information
            cy.readFile(userListPath).then(json => {
                const {Email} = _.get(json, User)
                userEmail = Email
                console.log(userEmail)

                //delete all previous messages
                // cy.mailosaurDeleteAllMessages(serverId)
                cy.wait(1000)
                // cy.sendEmail(serverId, userEmail).then(email => {
                //     if(!email){
                //         cy.log('No emails found')
                //     }
                //     else{
                //         console.log(email.text.body)
                //         //validate the email subject
                //         expect(email.subject).to.equal('jaimy.be - Nous avons envoyé vos coordonnées aux clients')

                //         //THE VARIABLES ARE UNDEFINED -> CANNOT BE READ ??
                //         console.log(jobRef)
                //         //i need to call the post request for the these validations here :)


                //         // const containsRef = email.text.body.indexOf(jobRef.toString()) > -1
                //         // const containsDescription = email.text.body.indexOf(jobDescription) > -1
                //         // const containsPostcode = email.text.body.indexOf(jobPostcode) > -1

                //         // console.log(jobRef)
                //         // console.log(jobDescription)
                //         // console.log(jobPostcode)

                //         // console.log(containsRef)
                //         // console.log(containsDescription)
                //         // console.log(containsPostcode)

                //     }
                // })
             })
        })    
    }

    // paymentValidation(User){
    // //    cy.get('[data-cy="username"]').click()  
    // //    cy.contains('Mes factures').click()


    //      cy.readFile(userListPath).then(json => {
    //         const {Email} = _.get(json, User)
    //         userEmail = Email
    //         console.log(userEmail)
    //         cy.sendEmail(serverId, userEmail).then(email => {
    //             if(!email){
    //                 cy.log('No emails found')
    //             }
    //             else{
    //                 cy.log(email.subject)
    //                 expect(email.subject).to.equal('jaimy.be - Nous avons envoyé vos coordonnées aux clients')
    //             }
    //         })
    //      })


    // }


    paymentSR(){
        cy.readFile(paymentLink).then(json => {
            linkToPay = json.link
            cy.visit(linkToPay)

            cy.readFile(jobData).then(json => {
                const totalSum = parseFloat(json.totalSum)
                cy.contains(totalSum)
            })  
            cy.contains('Bancontact').click()
            cy.wait(1000)
            cy.contains('Payé').click()
            cy.wait(1000)
            cy.contains('Continuer').click()
        })
    
    }

    prepaidCard(type, credit, negativeSum){
        cy.readFile(dynamicTraderData).then(json => {
            const Email = json.dynamicCurrentEmail 
            //send the password reset email
            cy.getEmailBySubject(serverId, Email, 'Votre facture Jaimy est arrivée')
            .then(email => {
                    // No email sent in time, resend and recall the function
                if (!email) {
                    cy.log('No emails found')    
                } 
                else{
                    cy.log(email.subject)
                    emailContent = email.text.body
                    const emailContentSplittedInTwo = emailContent.split("ci-dessous :")
                    const SecondContentSplittedInTwo = emailContentSplittedInTwo[1].split('Des questions sur votre facture?')
                    const splittedLink = SecondContentSplittedInTwo[0].split('https')
                    linkToPay = 'https'+splittedLink[1]

                    cy.visit(linkToPay).then(() => {
                        if(type == 'pay'){
                            // cy.visit(linkToPay)
                            paymentOp.validatePrice(credit)
                            cy.contains('Bancontact').click()
                            cy.wait(1000)
                            cy.contains('Payé').click()
                            cy.wait(1000)
                            cy.contains('Continuer').click()    
                        } else if (type=='payPrepaidWithNegativeInvoice'){
                            if(negativeSum!==null){
                                // cy.visit(linkToPay)
                                paymentOp.validatePriceWithNegativeInvoice(credit, negativeSum)
                                cy.contains('Bancontact').click()
                                cy.wait(1000)
                                cy.contains('Payé').click()
                                cy.wait(1000)
                                cy.contains('Continuer').click()  
    
                            }
                        }
                    })

                    // if(type == 'pay'){
                    //     // cy.visit(linkToPay)
            
                    //     paymentOp.validatePrice(credit)
                    //     cy.contains('Bancontact').click()
                    //     cy.wait(1000)
                    //     cy.contains('Payé').click()
                    //     cy.wait(1000)
                    //     cy.contains('Continuer').click()    
                    // } else if (type=='payPrepaidWithNegativeInvoice'){
                    //     if(negativeSum!==null){
                    //         // cy.visit(linkToPay)
                    //         paymentOp.validatePriceWithNegativeInvoice(credit, negativeSum)
                    //         cy.contains('Bancontact').click()
                    //         cy.wait(1000)
                    //         cy.contains('Payé').click()
                    //         cy.wait(1000)
                    //         cy.contains('Continuer').click()  

                    //     }
                    // }

                }  
            }) 
           
           
        })      
    }
  
    validatePriceForMultiplePayment(compensationSum){
        cy.readFile(jobData).then(json => {
            const jobPrice = parseFloat(json.jobPriceEuros)
            const tax = 0.21*jobPrice
            const priceWithTaxes = jobPrice + tax
            const creditTax = 0.21*compensationSum
            const diff = (priceWithTaxes - parseFloat(compensationSum)-parseFloat(creditTax)).toFixed(2)
            const intValue = Math.trunc(diff)
            const decimals = diff.toString().split(".")
            const first2decimals = decimals[1].substring(0,2)
            cy.contains(intValue+','+first2decimals)
          
        })  
    }

    validatePrice(credit){
        const sum = parseFloat(credit)
        const tax = 0.21*sum
        const priceWithTaxes = sum + tax 
        const intValue = Math.trunc(priceWithTaxes)
        const decimals = priceWithTaxes.toFixed(2).toString().split(".")
        const first2decimals = decimals[1].substring(0,2)
        cy.contains(intValue+','+first2decimals)
    }

    validatePriceWithDiscount(discount){
        cy.readFile(jobData).then(json => {
            const jobPrice = parseFloat(json.jobPrice)
            const newPrice = (parseFloat(jobPrice) - (parseFloat(discount)/100 * parseFloat(jobPrice)))/100
            const priceWithTaxes = newPrice  +(0.21*newPrice)
            console.log(priceWithTaxes)
            const intValue = Math.trunc(priceWithTaxes)
            const decimals = priceWithTaxes.toFixed(2).toString().split(".")
            const first2decimals = decimals[1].substring(0,2)
            cy.contains(intValue+','+first2decimals)
          
        })  
    }

    validatePriceWithNegativeInvoice(credit, negativeSum){
        const creditFloat = parseFloat(credit)
        const negativeSumFloat = parseFloat(negativeSum)
        const tax = 0.21*creditFloat
        const priceWithTaxes = creditFloat + tax 
        const sum = priceWithTaxes - negativeSumFloat
        const intValue = Math.trunc(sum)
        const decimals = sum.toFixed(2).toString().split(".")
        const first2decimals = decimals[1].substring(0,2)
        cy.contains(intValue+','+first2decimals)    
        console.log('hello')
    }

    waitForEmail(emailType){
        cy.readFile(dynamicTraderData).then(json => {
            const Email = json.dynamicCurrentEmail 
            //send the password reset email
            if(emailType=='prepaidInvoice'){
                cy.getEmailBySubject(serverId, Email, 'Votre facture Jaimy est arrivée')
                .then(email => {
                        // No email sent in time, resend and recall the function
                    if (!email) {
                        cy.log('No emails found')    
                    } 
                    else{
                        cy.log('Prepaid email has been sent')
                    }
                })
            }
            else {
                cy.getEmailBySubject(serverId, Email, 'Rectification sur votre facture!')
                .then(email => {
                        // No email sent in time, resend and recall the function
                    if (!email) {
                        cy.log('No emails found')    
                    } 
                    else{
                        cy.log('Rectification email has been sent')
                    }
                })
            }
        })
    }

    payNegativeInvoice(prepaidSum, negativeSum){
        paymentOp.validatePriceWithNegativeInvoice(prepaidSum, negativeSum)
        cy.contains('Bancontact').click()
        cy.wait(1000)
        cy.contains('Payé').click()
        cy.wait(1000)
        cy.contains('Continuer').click()  
    }


}

export const paymentOp = new paymentOperations()