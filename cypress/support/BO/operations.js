///<reference types="cypress"/>
import _ from "lodash";

const userListPath = 'cypress/integration/usersBO.json'
const traders = 'cypress/integration/traders.json'
const dynamicTraderData = 'cypress/support/Data/traderData.json'
const invoiceData = 'cypress/support/Data/invoiceData.json'
const traderData = 'cypress/support/Data/traderData.json'

var traderId
var date = new Date()

export class BOPage{

    /////////////////////////////////////////
    ////////////LOGIN TRADER/////////////
    ///////////////////////////////////////
    login(User){
        cy.intercept('POST', 'https://auth.jaimystaging.be/api/users/login').as('login')
        cy.readFile(userListPath).then(json => {
            const { username, password} = _.get(json, User)
            cy.get('input[placeholder="Email"]').type(username.toString())
            cy.get('input[placeholder="Password"]').type(password.toString())
            cy.contains('Login').click()
            cy.wait('@login').then(xhr => {
                expect(xhr.state).to.equal('Complete')
            })
        })
    }

    logout(){
        cy.get('button[class="MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit MuiIconButton-sizeMedium css-1drqkcs-MuiButtonBase-root-MuiIconButton-root"]').click({multiple: true, force: true})
        cy.wait(2000)
        cy.contains('Logout').click()
    }
    
    publishJob(){
        cy.get('a[aria-label="RFQ List"]').click()
    }

    searchForTrader(User){
        cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders_list?page=1&per_page=25').as('tradersList')
        cy.get('a[aria-label="Trader List"]').click()
        cy.readFile(traders).then(json => {
            const { FirstName, LastName, CompanyName, Phone, Street, Number, Postcode, City} = _.get(json, User)

            cy.readFile(dynamicTraderData).then(json => {
                const dynamicEmail = json.dynamicCurrentEmail 
                const emailAddress= dynamicEmail.split('@')
                cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders_list?page=1&search_value='+emailAddress[0]+'%40'+emailAddress[1]+'&per_page=25').as('searchTrader')

                //wait for the traders list to load
                cy.get('input[placeholder="Search"]').clear()
                cy.wait('@tradersList').then(xhr => {
                    expect(xhr.state).to.equal('Complete')
                })

                //wait for the trader search to load
                cy.get('input[placeholder="Search"]').type(dynamicEmail.toString())
                cy.wait('@searchTrader').then(xhr => {
                    expect(xhr.state).to.equal('Complete')
                    expect(xhr.response.body[0].firstname).to.equal(FirstName.toString())
                    expect(xhr.response.body[0].lastname).to.equal(LastName.toString())
                    expect(xhr.response.body[0].email).to.equal(dynamicEmail.toString())
                    traderId=xhr.response.body[0].id
                    cy.wait(5000)
                })

                cy.get('[class="jss19 jss27"]').invoke('text').then((id) => {
                    cy.log('The trader id is ' + id)
                    // expect(id).to.equal(traderId.toString())
                })

                cy.get('.MuiTableBody-root').eq(0).click().then(() => {
                    cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId).as('profileLoad')
                    cy.wait('@profileLoad').then(xhr => {
                        expect(xhr.state).to.equal('Complete')

                        //the body is null for this request?
                        console.log(xhr.response.body)
                        // expect(xhr.response.body.firstname)to.equal(FirstName.toString())
                        // expect(xhr.response.body[0].lastname).to.equal(LastName.toString())
                        // expect(xhr.response.body[0].email).to.equal(Email.toString())
                        // expect(xhr.response.body[0].zip).to.equal(Postcode.toString())
                        // expect(xhr.response.body[0].address).to.equal(Street.toString()+' '+Number.toString())
                        // expect(xhr.response.body[0].city).to.equal(City.toString())
                        // expect(xhr.response.body[0].phone).to.contain(Phone.toString())
                        // expect(xhr.response.body[0].id).to.equal(traderId)

                    })
                  
                })
            })
        })
    }

    changeStatus( newStatus){
        cy.contains('Email').click()
        cy.wait(2000)

        cy.readFile(dynamicTraderData).then(json => {
            const traderId = json.traderId
            cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/' + traderId).as('statusLoad')

                cy.get('span[class="MuiTypography-root MuiTypography-body1 MuiListItemText-primary css-10hburv-MuiTypography-root"]').contains('Checked').click()
                cy.wait(4000)
                console.log(newStatus)
                cy.get('span[class="MuiTypography-root MuiTypography-body1 MuiListItemText-primary css-10hburv-MuiTypography-root"]').contains(newStatus.toString()).click()
                cy.contains('Save').click()
                cy.wait('@statusLoad').then(xhr => {
                    expect(xhr.state).to.equal('Complete')
                })      
            cy.wait(3000)

        })
        
    }

    prepaid(sum){
        cy.readFile(dynamicTraderData).then(json => {
            const traderId = json.traderId
            cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId+'/add_credits').as('prepaid')

            cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click()     
            cy.contains('Invoice credits (prepaid)').click()
            cy.get('input[name="credit_euro_cents"]').type(sum)
            cy.wait(1000)
            cy.contains('SUBMIT').click().then(() => {
                cy.wait('@prepaid').then((xhr) => {
                    expect(xhr.state).to.equal('Complete')
                    console.log('response')
                    // expect(xhr.request.body.credit_euro_cents).to.equal(sum*100)
                    // expect(xhr.request.body.credit_type).to.equal('prepaid')
                    
                })
            })
        })

    }
        
    compensation(jobRef, sum){
            cy.readFile(dynamicTraderData).then(json => {
                const traderId = json.traderId
                cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId+'/add_credits').as('compensation')
            
                cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click()
                cy.contains('Compensation').click()
                cy.contains('Compensation').click()
                cy.contains('Specific job').click()
                cy.get('input[placeholder="Search and click to add"]').click()
                cy.wait(4000)

                cy.contains(jobRef+' - ').click()
                cy.wait(2000)
                cy.get('div[id="mui-component-select-service_requests[0].reason"]').click()
                cy.get('li[data-value="other"]').click()

                cy.wait(1000)
                cy.get('input[name="credit_euro_cents"]').clear()
                cy.get('input[name="credit_euro_cents"]').type(sum)

                cy.contains('SUBMIT').click().then(() => {
                    cy.wait('@compensation').then((xhr)=>{
                        expect(xhr.state).to.equal('Complete')
                        // expect(xhr.request.body.credits_remaining).to.equal(sum*100)
                        // expect(xhr.request.body.credit_type).to.equal('compensation')
                    })
                })
            })
            cy.reload()
            cy.contains('(excl. VAT)').parent().parent().find('span[class="styles_value__zNZDr"]').contains(sum + ' EUR')
    }

    negativeInvoice(negativeSum){
        cy.readFile(invoiceData).then(invoiceJson => {
            cy.readFile(traderData).then(traderJson => {
                const invoiceId=invoiceJson.invoiceId
                const invoiceNumber=invoiceJson.invoiceNumber

                const traderId=traderJson.traderId
                cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId+'/negative_invoice?invoice_id='+invoiceId+'&negative_invoice_price_cents='+negativeSum*100).as('negativeInvoice')
                cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click()      

                cy.contains('Compensation').trigger('mouseover', {force:true})
                cy.contains('Negative invoice').click({force:true})

                cy.get('input[placeholder="Select an invoice"]').clear()
                cy.get('input[name="invoice_id"]')

            
                cy.contains('#'+invoiceNumber+'; ').click({force:true})
                cy.get('input[name="neg_price"]').type(negativeSum.toString())
                cy.contains('SEND NEGATIVE INVOICE').click()
                
                // to be investigated
                cy.wait('@negativeInvoice').then((xhr) => {
                    expect(xhr.state).to.equal('Complete')
                    console.log(xhr.response)
                    expect(xhr.response.body).to.equal(true)
                })
            })
        })     
    }

    marketing(marketingSum){

        cy.readFile(dynamicTraderData).then(json => {
            const traderId = json.traderId
            cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId+'/add_credits').as('marketing')


            cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click()     
            cy.contains('Marketing').trigger('mouseover', {force:true})
            cy.contains('Give marketing credits').click({force:true})
            cy.get('input[name="credit_euro_cents"]').type(marketingSum)
            cy.wait(1000)
            cy.contains('SUBMIT').click()
            .then(() => {
                cy.wait('@marketing').then((xhr) => {
                    expect(xhr.state).to.equal('Complete')
                    // expect(xhr.request.body.credit_euro_cents).to.equal(sum*100)
                    // expect(xhr.request.body.credit_type).to.equal('prepaid')
                })
            })

         })

    }

    discount(sum){

        cy.readFile(dynamicTraderData).then(json => {
            const traderId = json.traderId
            cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId+'/discount').as('discount')
    
            cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click()     
            cy.contains('Marketing').click({force:true})
            cy.contains('Marketing').click({force:true})
            cy.wait(2000)
            cy.contains('Apply discount').click({force:true})
            cy.get('input[name="discount_of"]').type(sum)
            cy.wait(1000)

            cy.contains('SUBMIT').click()
            .then(() => {
                cy.wait('@discount').then((xhr) => {
                    expect(xhr.state).to.equal('Complete')
                })
            })

         })

    }

    validateEventsNumber(minimumEvents){
        cy.readFile(dynamicTraderData).then(json => {
            const traderId = json.traderId
            cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId+'/timeline?&').as('timeline')
            cy.reload()
            cy.wait('@timeline').then((xhr)=>{
                var numberOfEvents = xhr.response.body.length
                console.log(numberOfEvents)
                if(numberOfEvents>=minimumEvents){
                    cy.log('Events ok')
                }else{
                    throw new Error('Missing minimum events');
                }
            })
        })
    }

    validateCreditsUI(sum){
        cy.reload()
        cy.get('div[class="styles_asideInfoContainer__2eGzh"]').contains('Credits').parent().contains(sum + ' EUR')
    }

    validatePurchasedJobsUI(numberOfPurchasedJobs){
        cy.contains('Purchased ('+numberOfPurchasedJobs+')').should('be.visible')    
    }

    changeSubscription(subscription) {
        cy.readFile(dynamicTraderData).then(json => {
            const traderId = json.traderId
            cy.intercept('GET', 'https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/' + traderId + '/subscription').as('subscription')
            cy.contains('local').click({ force: true })
            cy.contains('Modify Subscription').click({ force: true })
            cy.get('div[aria-labelledby="select-input-type mui-component-select-type"]').click({ force: true })
            cy.wait(1000)
            switch (subscription) {
                case "pro":
                    cy.get('li[data-value="pro"]').click()
                    break;
                case "premium":
                    cy.get('li[data-value="premium"]').click()
                    break;
                case "trial_pro":
                    cy.get('li[data-value="trial_pro"]').click()
                    break;
                case "trial_premium":
                    cy.get('li[data-value="trial_premium"]').click()
                    break;
            }

            cy.get('div[aria-labelledby="select-input-subscription_length mui-component-select-subscription_length"]').click({ force: true })
            cy.wait(1000)

            cy.get('li[data-value="3"]').click({ force: true })
            cy.wait(1000)

            cy.get('[aria-label="Choose date"][type="text"]').eq(0).click({ force: true })
            cy.wait(1000)

            cy.get('[aria-label="calendar view is open, go to text input view"]').click()
            
            if(date.getDate()<10){
                if(date.getMonth() < 10){
                    cy.get('[placeholder="dd/mm/yyyy"]').type(`0${date.getDate()}/0${date.getMonth()}/${date.getFullYear()}`)
                }else{
                    cy.get('[placeholder="dd/mm/yyyy"]').type(`0${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`)
                }
            } else{
                if(date.getMonth() < 10){
                    cy.get('[placeholder="dd/mm/yyyy"]').type(`${date.getDate()}/0${date.getMonth()}/${date.getFullYear()}`)
                }else{
                    cy.get('[placeholder="dd/mm/yyyy"]').type(`${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`)
                }
            }
           

            cy.contains('OK').click()
            cy.contains('SUBMIT').click({ force: true }).then(() => {
                cy.wait('@subscription').then((xhr) => {
                    expect(xhr.state).to.equal('Complete')
                    console.log(xhr.body)
                    expect(xhr.response.body.subscription).to.equal(subscription)
                })
            })
        })


    }

    activateInvoiceLater(amount) {
        cy.get('svg[data-testid="EditIcon"]').click()
        cy.get('input[name="invoice_amount_authorized"]').clear().type(amount)
        cy.contains('SUBMIT').click()
    }

    checkPaidSubscription() {

    }

    validateTimeline(event, sum, iterations, multipleJobs){
        cy.readFile(dynamicTraderData).then(json => {
            const traderId = json.traderId
            cy.intercept('https://jaimy-api.jaimystaging.be/api/backoffice/v1/traders/'+traderId+'/timeline?&').as('timeline')
            cy.reload()
            cy.wait('@timeline').then((xhr)=>{
                expect(xhr.state).to.equal('Complete')
                switch(event){

                    case "validated":
                        expect(xhr.response.body[0].metadata.new_state).to.equal(event)
                    break;

                    case "marketing":
                        var number=0
                        for(var i=0; i<=1; i++){
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "credit":
                                    //credits marketing
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('marketing')
                                    expect(xhr.response.body[i].metadata.payment_method).to.equal('invoice_later_credit')
                                    expect(xhr.response.body[i].metadata.amount).to.equal(sum*100)
                                    number++
                                    break;
                                case "invoice":
                                    //this gets sent very late - it can not be counted
                                    //invoice paid - for the marketing credits - 0 euros
                                    expect(xhr.response.body[i].metadata.status).to.equal('paid')
                                    expect(xhr.response.body[i].amount).to.equal('0')                                 
                                    break;
                            }
                        }
                        if(number>=1){
                            cy.log('Events ok')                        
                        }else{
                            throw new Error('Missing events');
                        }
                    break;

                    case "compensation":
                        var number=0
                        //it will traverse the first 3 elements, since one of them could be the remaining invoice that was sent meanwhile
                        for(var i=0; i<=3; i++){
                            console.log(xhr.response.body)
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "credit":
                                    //credits compensation
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('compensation')
                                    expect(xhr.response.body[i].metadata.amount).to.equal(sum*100)
                                    expect(xhr.response.body[i].metadata.payment_method).to.equal('invoice_later_credit')
                                    number++
                                break;
                                case "invoice":
                                    //compensation invoice - paid 0 euros
                                    expect(xhr.response.body[i].metadata.status).to.equal('paid')
                                    number++                                    
                                break;
                                case "mail":
                                    //this gets sent very late - it can not be counted
                                    //send_invoice_with_free_lead email sent - invoice for the compensation
                                    if(xhr.response.body[i].metadata.email_type=='send_invoice_with_free_lead'){
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                        expect(xhr.response.body[i].metadata.title).to.equal('Votre facture Jaimy est arrivée')
                                    }else{
                                        //there is the possibility of the previous mails to appear here
                                        break;
                                    }
                                break;
                            } 
                        }

                        if(number>=2){
                                cy.log('Events ok')
                        }else{
                            throw new Error('Missing events');
                        }
                       
                    break;

                    case "creditPurchase":
                        var number=0
                        //it will traverse the first 5 elements, since 2 of them could be the remaining invoices that were sent meanwhile
                        for(var i=0; i<=iterations; i++){
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "purchase":
                                    //1 job purchased
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('success')
                                    expect(xhr.response.body[i].metadata.payment_method).to.equal('credit') 
                                    number++
                                break;
                                case "mail":
                                    if(xhr.response.body[i].metadata.email_type=="cart_trader"){
                                        //Cart purchased jobs email sent
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                        expect(xhr.response.body[i].metadata.title).to.equal('Nous avons envoyé vos coordonnées aux clients')
                                        number++
                                    } else {
                                        //this is sent very late
                                        //Invoice email sent
                                        if(xhr.response.body[i].metadata.email_type=='send_invoice_mollie'){
                                            expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                            expect(xhr.response.body[i].metadata.title).to.equal('Réception du paiement. Voici votre facture!')
                                        } else{
                                            break;
                                        }
                                    }
                                break;
                            }
                        }

                        if(number>=2){
                            cy.log('Events ok')                       
                         }else{
                            throw new Error('Missing events');
                        }
                    break;
                    
                    case "prepaid":
                        var number=0
                        for(var i=0; i<=2; i++){
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "mail":
                                    //this can be sent very late
                                    //send_invoice email sent
                                    expect(xhr.response.body[i].metadata.email_type).to.equal('send_invoice')
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                    expect(xhr.response.body[i].metadata.title).to.equal('Votre facture Jaimy est arrivée')
                                break;
                                case "credit":
                                    //credits prepaid
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('prepaid')
                                    expect(xhr.response.body[i].metadata.payment_method).to.equal('invoice_later_credit')
                                    expect(xhr.response.body[i].metadata.amount).to.equal(sum*100)
                                    number++
                                break;
                                case "invoice":
                                    //invoice not paid
                                    expect(xhr.response.body[i].metadata.status).to.equal('not_paid')
                                    const tax = 0.21*sum
                                    expect(xhr.response.body[i].metadata.amount).to.equal((tax+sum)*100)
                                    number++
                                    cy.writeFile(invoiceData, {invoiceId: xhr.response.body[i].metadata.id, invoiceNumber: xhr.response.body[i].metadata.invoice_number})
                                break;
                            }
                        }
                        if(number>=2){
                            cy.log('Events ok')                       
                        }else{
                            throw new Error('Missing events');
                        }
                    break;

                    case "paidPrepaid":
                        for(var i=0; i<=2; i++){
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "mail":
                                    //this can be sent very late
                                    //send_invoice email sent
                                    expect(xhr.response.body[i].metadata.email_type).to.equal('send_invoice')
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                    expect(xhr.response.body[i].metadata.title).to.equal('Votre facture Jaimy est arrivée')
                                break;
                                case "invoice":
                                    //invoice not paid
                                    //BUG - NOT WORKING ATM
                                    expect(xhr.response.body[i].metadata.status).to.equal('paid')
                                break;
                            }
                        }
                    break; 

                    case "discount":
                        expect(xhr.response.body[0].item_type).to.equal('freelead')
                        expect(xhr.response.body[0].metadata.event_type).to.equal('freelead_add') 
                        if(sum == 10){
                            expect(xhr.response.body[0].metadata.name).to.equal('DISCOUNT_OF_10') 

                        } else {
                            expect(xhr.response.body[0].metadata.name).to.equal('DISCOUNT_OF_90') 
                        }
                    break; 

                    case "multiplePayments":
                        var number =0;
                        for(var i=0; i<=iterations; i++){
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "mail":
                                    if(xhr.response.body[i].metadata.email_type=="cart_trader"){
                                        //Cart purchased jobs email sent
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                        expect(xhr.response.body[i].metadata.title).to.equal('Nous avons envoyé vos coordonnées aux clients')
                                        number++
                                    } else {
                                        break;
                                    }
                                break;
                                case "purchase":
                                    //1 job purchased
                                    if(xhr.response.body[i].metadata.payment_method=='credit'){
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('success')
                                        number++
                                    } else {
                                        break;
                                    }
                                    
                                break;
                                case "credit":
                                    //Credits purchased
                                    if( xhr.response.body[i].metadata.event_type=="purchased"){
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('purchased')
                                        expect(xhr.response.body[i].metadata.payment_method).to.equal('bancontact')
                                        number++
                                    } else{
                                        //do nothing, since it will validate the marketing credit event 
                                        //which is already being validated in the previous its
                                        break;
                                    }
                                break;
                                case "invoice":
                                    if(xhr.response.body[i].metadata.status=='paid_via_mollie'){
                                        number++
                                    }else{
                                        break;
                                    }
                                break;
                            }
                        }
                        if(number>=4){
                            cy.log('Events ok')
                        }else{
                            throw new Error('Missing events');
                         }
                    break;
 
                    case "jobWithCreditCard":
                        var number=0
                        for(var i=0; i<=3; i++){
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "purchase":
                                    //1 job purchased
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('success')
                                    expect(xhr.response.body[i].metadata.payment_method).to.equal('bancontact')
                                    number=number+1
                                break;
                                case "mail":
                                    //this gets sent very late - it can not be counted
                                    //Invoice email sent
                                    if(xhr.response.body[i].metadata.email_type=='send_invoice_mollie'){
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                        expect(xhr.response.body[i].metadata.title).to.equal('Réception du paiement. Voici votre facture!')
                                    }else{
                                        //Cart purchased jobs email sent
                                        expect(xhr.response.body[i].metadata.email_type).to.equal('cart_trader')
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                        expect(xhr.response.body[i].metadata.title).to.equal('Nous avons envoyé vos coordonnées aux clients')
                                        number=number+1
                                    }
                                break;
                                case "invoice":
                                    //Invoice paid through website
                                    expect(xhr.response.body[i].metadata.status).to.equal('paid_via_mollie')
                                    number=number+1
                                break;
                            }
                        }
                        if(number>=3){
                            cy.log('Events ok')                       
                         }else{
                            throw new Error('Missing events');
                        }
                    break;

                    case "multipleSR":
                        expect(xhr.response.body[0].item_type).to.equal('cart')
                        expect(xhr.response.body[0].metadata.event_type).to.equal('added')
                        expect(xhr.response.body[0].metadata.service_requests.length).to.equal(multipleJobs)
                    break;

                    case "negativeInvoice":
                        for(var i=0; i<=1; i++){
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "mail":
                                    if(xhr.response.body[i].metadata.email_type=='send_negative_invoice'){
                                        expect(xhr.response.body[i].metadata.title).to.equal('Rectification sur votre facture!')
                                        expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                    }else{
                                        break;
                                    }
                                break;
                                case "invoice":
                                    expect(xhr.response.body[i].metadata.status).to.equal('negative_invoice')
                                    expect(xhr.response.body[i].metadata.amount).to.equal(sum*100)
                                   
                                break;
                            }
                        }
                    break;

                    case "premium" :
                        var number=0
                        var len = xhr.response.body.length
                        cy.log('len is '+len)
                        for(var i=0; i<=len-1; i++){
                            cy.log('i is' +i)
                            var response = xhr.response.body[i].item_type
                            switch(response){
                                case "invoice":
                                    cy.log('invoice')
                                    //Invoice not paid
                                    expect(xhr.response.body[i].metadata.status).to.equal('not_paid')
                                    number++
                                    cy.writeFile(invoiceData, {invoiceId: xhr.response.body[i].metadata.id, invoiceNumber: xhr.response.body[i].metadata.invoice_number})
                                break;
                                case "subscription":
                                    cy.log('subscription')

                                    //subscription_chang
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('subscription_change')
                                    expect(xhr.response.body[i].metadata.new_subscription).to.equal(event)
                                    number++
                                break;
                                case "mail":
                                    cy.log('mail')

                                    //send_subscription_invoice email sent
                                    expect(xhr.response.body[i].metadata.email_type).to.equal('send_subscription_invoice')
                                    expect(xhr.response.body[i].metadata.event_type).to.equal('outbound')
                                    expect(xhr.response.body[i].metadata.title).to.equal('Votre facture Jaimy est arrivée')
                                break;
                            }
                        }
                        console.log('number is' + number)
                        cy.log('number is' + number)

                        if(number>=2){
                            cy.log('Events ok')                       
                         }else{
                            throw new Error('Missing events');
                        }
                    break;

                }
            })
        })
    }
}

export const bo = new BOPage()