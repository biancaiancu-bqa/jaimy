///<reference types="cypress"/>
import _ from "lodash";
import 'cypress-mailosaur'

const userListPath = 'cypress/integration/traders.json'
const jobData = 'cypress/support/Data/jobData.json'
const invoiceData = 'cypress/support/Data/invoiceData.json'
const paymentLink = 'cypress/support/Data/paymentLink.json'

var linkToPay
var linkToPay
var jobRef
var jobPrice
var jobDescription
var jobPostcode
var userEmail
var priceEuros
var jobIndex = 0
var index = 0
var totalSum=0
var ok = 0

// var multipleJobsIndex = 0 
// var jobPrices = []
// const indexPrices = 0



export class jobOperations{

    emptyCart(){
        cy.get('[data-cy-button="cart-link-button"]').click()
        cy.wait(4000)

        cy.get('body').then((body) => {
            //if the message is displayed, the cart is already empty
			if (body.find('span:contains(Oups! Votre panier est vide)').length > 0){
                cy.log('Empty cart. Nothing to delete')
            }
            else{
                //else, the number of items will be read and all the products will be deleted
                cy.get('[data-cy-span="cart-length"]').invoke('text').then((noOfNumbers) => {
                    cy.log('The cart contains ' + noOfNumbers)
        
                    for(let i = 0; i<noOfNumbers; i++){
                        cy.log('attempt number ' + i )
                        cy.log(noOfNumbers)
                        cy.wait(2000)
                        cy.get('button').contains('Retirer').eq(0).click({force:true}) 
                    }
                })
            }
        })  

    }

    
    
    addToCart(payMode, factureMode, maxPrice, discount){
        
        //wait for the main page to load the jobs list
        cy.intercept('https://jaimy-api.jaimystaging.be/api/traders/v1/service_requests').as('pageLoad')
        cy.contains('Liste des chantiers').click()
        cy.wait(2000)
        cy.reload()


        cy.wait('@pageLoad').then(xhr => {

            expect(xhr.state).to.equal('Complete')
            jobRef = xhr.response.body[jobIndex].id
            jobPrice = xhr.response.body[jobIndex].price_cents
            jobPostcode = xhr.response.body[jobIndex].postcode
            jobDescription = xhr.response.body[jobIndex].description

            console.log(jobRef)
            console.log(jobPrice)
            console.log(jobPostcode)
            console.log(jobDescription)

            if(jobPrice > maxPrice*100) { 
                cy.get('[data-cy-button="more-info"]').eq(jobIndex).click()

                // if(jobIndex == 0){
                //     cy.contains("N'allez pas si vite ! Vous ne pouvez acheter que 3 missions d'un montant maximum de 40 € chacune, pendant que nous vérifions votre compte.")
                //     cy.wait(4000000)

                // } else{
                //     cy.contains("N'allez pas si vite ! Vous ne pouvez acheter que 3 missions pendant que nous vérifions votre compte. Vous pouvez encore acheter 2 missions d'un montant maximum de 40 € chacune.")

                // }
               
                cy.wait(2000)
                jobIndex = jobIndex+1
                jobOp.addToCart(payMode, factureMode, maxPrice)

            } 
            else{
                console.log('nextjob')
                cy.get('[data-cy-button="more-info"]').eq(jobIndex).click()
                 cy.contains('€ HT').invoke('text').then((price) => {
                     console.log(price)
                     priceEuros = price.split(" ")
                     console.log(priceEuros[0])
                     console.log(typeof priceEuros)
                     cy.writeFile(jobData, {jobRef: jobRef.toString(), jobPrice: jobPrice.toString(), jobPriceEuros: priceEuros[0].toString()})
                 })

                 cy.wait(3000)


                 ///////////
                 //PAY DIRECT FROM "VOIR PLUS"
                 if(payMode ===  'payDirect'){
         
                     cy.contains('Achat immédiat').click()
                     
                     //not available for probation
                     //INSTANT PAYMENT
                     // if(factureMode === 'payNow'){
                     //     cy.contains('Paiement en ligne').click()
                         cy.wait(2000)
                         cy.url().then(url => {
                             cy.writeFile(paymentLink, {link: url.toString()})
                         }).then(() => {
                            
                         })
                     // }else{
                     // //PAY BY INVOICE LATER
                     //     cy.contains('Facture mensuelle').click()
             
                     // }
                   
                 }else{
         
                 ///////////
                 ///PAY FROM ADDING TO THE CART
                 //wait for the job to be added in the cart 

                cy.intercept('https://jaimy-api.jaimystaging.be/api/traders/v1/service_requests/' + jobRef + '/cart_service_requests').as('pageLoad')
         
                cy.wait(2000)                 
                cy.get('[data-cy-button="add-to-cart"]').contains('Ajouter au panier').click()
         
                 cy.wait('@pageLoad')
                 cy.wait(3000)
                 cy.get('[data-cy-button="cart-link-button"]').click()
         
                 if(discount>0){
                       jobOp.validateDiscount(discount, jobPrice)
                 }

                 ////
                 cy.contains('Paiement').click()
         
                 //not available for probation
                 // //PAY DIRECT
                 // if(factureMode === 'payNow'){
                 //     cy.contains('Paiement en ligne').click()
                     cy.wait(2000)
                     cy.url().then(url => {
                         cy.writeFile(paymentLink, {link: url.toString()})
                     })
                 // }else{
                 // //PAY BY INVOICE LATER
                 //     cy.contains('Facture mensuelle').click()
         
                 // }
         
                 }
            }
           
        })
  
    }

    addToCartMultipleJobs(jobsNumber){
        //wait for the main page to load the jobs list
        cy.intercept('https://jaimy-api.jaimystaging.be/api/traders/v1/service_requests').as('reload')
        cy.contains('Liste des chantiers').click()
        cy.wait(2000)
        cy.reload()
        // console.log(maxPrice)
        cy.wait('@reload').then(xhr => {
            var totalSum = 0 
            expect(xhr.state).to.equal('Complete')

            //add each job to cart and validate the buttons
            for(var index=1; index<=jobsNumber; index++){
                cy.get('[data-cy-button="add-to-cart"]').eq(0).contains('Ajouter au panier').click()
                cy.wait(1000)
                cy.get('[data-cy-button="remove-from-cart"]').eq(index-1).contains('Ajoutée au panier')
                cy.wait(1000)
                cy.get('[data-cy-span="cart-length"]').invoke('text').should('equal', (index).toString())
                cy.wait(1000)
                totalSum = totalSum + xhr.response.body[index-1].price_cents
                console.log('totalSum'+totalSum)
            }

            cy.get('[data-cy-button="cart-link-button"]').click()
            cy.contains((totalSum/100).toString()+' €')

            //calculate the price with taxes
            const jobPrice = totalSum/100
            const tax = 0.21*jobPrice
            const priceWithTaxes = jobPrice + tax 

            const intValue = Math.trunc(priceWithTaxes)
            const decimals = priceWithTaxes.toFixed(2).toString().split(".")
            const first2decimals = decimals[1].substring(0,2)
            cy.contains('total à payer').parent().contains(intValue+'.'+first2decimals+ ' € TTC')

            cy.writeFile(jobData, {jobsNumber: jobsNumber.toString(), totalSum: decimals[0]+','+first2decimals})

            cy.contains('Paiement').click()
            cy.wait(2000)
            cy.url().then(url => {
                cy.writeFile(paymentLink, {link: url.toString()})

            })
        })    
    }

    validateDiscount(discount, jobPrice){
        const newPrice = (parseFloat(jobPrice) - (parseFloat(discount)/100 * parseFloat(jobPrice)))/100
        cy.contains('total à payer').parent().contains(newPrice+' €')
        const priceWithTaxes = newPrice  +(0.21*newPrice)
        const intValue = Math.trunc(priceWithTaxes)
        const decimals = priceWithTaxes.toFixed(2).toString().split(".")
        const first2decimals = decimals[1].substring(0,2)
        cy.contains('total à payer').parent().contains(intValue+'.'+first2decimals+ ' € TTC')
    }
    

    getInvoiceNumber(){
        cy.get('[data-cy="username"]').click()
        cy.get('[data-cy-menuitem="invoices"]').click()
        cy.get('span[class="sc-dSnXvR dzBcKB"]').eq(0).invoke('text').then((fileName) => {
            const invoiceNo = fileName.split(".")
            cy.writeFile(invoiceData, invoiceNo[0], {'flag': 'a+'})
        })
    }

    getInvoiceLink(){
        cy.get('[data-cy="username"]').click()
        cy.get('[data-cy-menuitem="invoices"]').click().then(()=>{
            cy.wait(2000)
            cy.contains('Payer maintenant').parent().find('a').should('have.attr', 'href').then((href) => {
                cy.writeFile(paymentLink, {link: href.toString()})
              })
        })
        
    }

    validateCredits(sum){
        console.log(sum)
        console.log(typeof sum)
        console.log(sum.toString())

        console.log(typeof sum.toString())
        cy.get('[data-cy="username"]').click()  
        cy.wait(1000)
        cy.contains('Crédit disponible').parent().parent().contains(sum+' €')

    }

    validateRemainingSum(credit){
        cy.readFile(jobData).then(json => {
            const jobPrice = parseFloat(json.jobPriceEuros)

            if(credit<jobPrice){
                console.log('No more credit')
                cy.get('[data-cy="username"]').click()  
                cy.contains('Crédit disponible').should('not.exist')

            } else{
                const diff = parseFloat(credit) - jobPrice
                jobOp.validateCredits(diff.toString())
            }
           
        })  
    }

    validateTheAbsenceOfCredit(){
        cy.get('[data-cy="username"]').click()  
        cy.contains('Crédit disponible').should('not.exist')
    }

    validatePurchasedJob(jobsNo){
        cy.contains('Mes achats').click()
        if(jobsNo == 1){
            cy.contains('Une mission')
        } else{
            cy.contains(jobsNo+' missions')
        }
    }

}

export const jobOp = new jobOperations()