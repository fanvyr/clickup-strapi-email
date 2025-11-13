/**
 * email controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::email.email', ({ strapi }) => ({
  async sendMail(ctx) {
    const { id } = ctx.params;

    // instant return response to webhook
    ctx.send('lets see')

    console.log('inside sendmail', id);

    // check if id is a number
    if (/^-?\d+$/.test(id) !== true) return ctx.badRequest('ID musst be a number')

    // get the email config from database
    const emailConfig = await strapi.documents('api::email.email').findFirst({
      filters: {
        id: { $eq: parseInt(id) }
      }
    });

    // if no email config is found, return 404
    if (!emailConfig) return ctx.notFound('Email config not found')

    const globalConfig = await strapi.documents('api::configuration.configuration').findFirst({})

    if (!globalConfig) throw new Error('Global config not found')

    // get toAddress if customToAddress is set, otherwise use the email address from the email config
    const toAddress = emailConfig.customToAddress || ctx.request.body.payload.custom_fields.find((field: any) => field.name === emailConfig.fieldContainingMailAddress)?.value;

    if (!toAddress) throw new Error('To address not found')

    // transform the payload to the correct format for the email service
    let payload = strapi.services['api::email.email'].transformPayload(ctx.request.body, globalConfig);

    console.log('payload', payload);
    console.log('toAddress', toAddress);

    let toConfig = {
      to: toAddress,
      from: emailConfig.fromAddress || process.env.EMAIL_USER,
    }

    // if ccTo is set, add it to the toConfig
    if (emailConfig.ccTo) {
      toConfig['cc'] = emailConfig.ccTo
    }

    // if replyTo is set, add it to the toConfig
    if (emailConfig.replyTo) {
      toConfig['replyTo'] = emailConfig.replyTo
    }

    // try to send the email 
    try {
      await strapi
        .plugin('email-designer-v5')
        .service('email')
        .sendTemplatedEmail({
          ...toConfig
        }, {
          templateReferenceId: emailConfig.mailReferenceId,
          context: payload,
          subject: emailConfig.subjectOverride ? emailConfig.subjectOverride : undefined,
        }, {
          ...payload
        })
      console.log('email sent successfully');
      // post success message to clickup if active
    } catch (error) {
      console.error('Error sending email', error);
      // post error message to clickup if active
      throw error;
    }


    // if yes, transform successmessage and errormessage with details
    // check if valid API token for clickup is set
    // if yes, send to clickup

    return
  }

}));  