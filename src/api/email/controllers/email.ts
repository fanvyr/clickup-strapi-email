/**
 * email controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::email.email', ({ strapi }) => ({
  async sendMail(ctx) {
    const { id } = ctx.params;
    console.log('inside sendmail', id);

    // check if id is a number
    if(/^-?\d+$/.test(id) !== true) return ctx.badRequest('ID musst be a number')

    // get the email config from database
    const emailConfig = await strapi.documents('api::email.email').findFirst({
      filters: {
        id: {$eq: parseInt(id)}
      }
    });

    // if no email config is found, return 404
    if(!emailConfig) return ctx.notFound('Email config not found')

    console.log('emailConfig', emailConfig);

    const globalConfig = await strapi.documents('api::configuration.configuration').findFirst({})

    console.log('globalConfig', globalConfig);

    // get toAddress if customToAddress is set, otherwise use the email address from the email config
    const toAddress = emailConfig.customToAddress // #TODO use fieldContainingMailAddress if set

    // transform the payload to the correct format for the email service
    let payload = strapi.services['api::email.email'].transformPayload(ctx.request.body, globalConfig);

    console.log('payload', payload);

    // add TaskName to varObj

    // try to send the email 

    // get global config, check if clickupresponse as active 

    

    // if yes, transform successmessage and errormessage with details
    // check if valid API token for clickup is set
    // if yes, send to clickup









    return ctx.send('Email sent successfully');
  }
  
}));  