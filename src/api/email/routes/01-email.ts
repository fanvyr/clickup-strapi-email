

export default {
  routes: [ {
    method: 'POST',
    path: '/send-email/:id',
    handler: 'email.sendMail',
  }],
};