const nodemailer = require('nodemailer');
require('dotenv').config()
const env = require('../config/env')

// const Mailer = nodemailer.createTransport({
//     host: env.mailhost,
//     port: env.mailport,
//     auth: {
//       user: env.mailusername,
//       pass: env.mailpass
//     }
// });


const Mailer = nodemailer.createTransport({
  name: 'govmu.org',
  host: env.mailhost,
  port: env.mailport,
  auth: {
    user: env.mailusername,
    pass: env.mailpass
  },
 tls: {
        rejectUnauthorized: false
    }
});

module.exports = Mailer