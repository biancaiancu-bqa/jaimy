pipeline {
  agent any
    triggers {
        cron(env.BRANCH_NAME == 'master' ? '0 0 * * *' : '')
    }
  options { disableConcurrentBuilds() }
  environment {
    NODE_VERSION = 'cypress/browsers:node14.17.0-chrome91-ff89'
  }
  stages {
    stage ('Install dependencies and run cypress') {
      /* Ensures the build .env file is present and then executes yarn install
      for shared dependencies*/
      agent {
        docker {
          image NODE_VERSION
          args "-u root:sudo -v $WORKSPACE:/e2e -w /e2e -v $JENKINS_HOME/node_modules:/var/lib/jenkins/node_modules -w /project"
        }
       }
       steps {
         sh 'npm install'
         sh 'npm run test:traderDashboard'
         sh 'npm run test:prepaidCardDashboard'
         sh 'npm run test:compensationDashboard'
         sh 'npm run test:marketingDashboard'
         sh 'npm run test:multiplePaymentCC'
         sh 'npm run test:multiplePaymentMC'
         sh 'npm run test:multiplePaymentPC'
         sh 'npm run test:discount10percent'
         sh 'npm run test:discount90percent'
         sh 'npm run test:multipleSR'
         sh 'npm run test:negativeInvoicePrepaid'

         script {
           try {
             sh 'npm run test:traderDashboard'
           } catch (Exception e) {
             echo 'traderDashboard Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:prepaidCardDashboard'
           } catch (Exception e) {
             echo 'prepaidCardDashboard Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:compensationDashboard'
           } catch (Exception e) {
             echo 'compensationDashboard Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:marketingDashboard'
           } catch (Exception e) {
             echo 'marketingDashboard Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:multiplePaymentCC'
           } catch (Exception e) {
             echo 'multiplePaymentCC Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:multiplePaymentMC'
           } catch (Exception e) {
             echo 'multiplePaymentMC Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:multiplePaymentPC'
           } catch (Exception e) {
             echo 'multiplePaymentPC Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:discount10percent'
           } catch (Exception e) {
             echo 'discount10percent Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:discount90percent'
           } catch (Exception e) {
             echo 'discount90percent Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:multipleSR'
           } catch (Exception e) {
             echo 'multipleSR Exception occurred: ' + e.toString()
           }
           try {
             sh 'npm run test:negativeInvoicePrepaid'
           } catch (Exception e) {
             echo 'negativeInvoicePrepaid Exception occurred: ' + e.toString()
           }
         }
       }
     }
   }
  post {
    /* Outputs useful log information, sends slack messages and wipes up the folder after the builds*/
    always {
      echo 'there is nothing to see here'
    }
    success {
      echo 'It was successful, no need to do anything about it.'
      slackSend channel: 'it-qa-logs',
        color: 'good',
        message: "SUCCESS Run <${env.BUILD_URL}|${env.BUILD_TAG}> :party-parrot:"
    }
    failure {
      slackSend channel: 'it-qa-logs',
        color: 'danger',
        message: "FAILURE Run <${env.BUILD_URL}|${env.BUILD_TAG}> FAILED!!! :panic:"
    }
    cleanup {
      sh 'pwd'
      sh 'ls -lah'
      echo WORKSPACE
      sh 'ls -lah $WORKSPACE/..'
      dir ("$WORKSPACE/..") {
        sh 'pwd'
        sh 'sudo chown -R jenkins:jenkins $WORKSPACE*'
        sh 'rm -rf $WORKSPACE*'
        sh 'ls -lah'
      }
      echo 'jenkins clean up'
      cleanWs deleteDirs: true, notFailBuild: true
      echo 'jenkins | delete work directory'
      deleteDir()
    }
  }
}
