export default ({env}) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('EMAIL_HOST'),
        port: env('EMAIL_PORT'),
        
        auth: {
          user: env('EMAIL_USER'),
          pass: env('EMAIL_PASS'),
        },
      },
    },
  },
});
