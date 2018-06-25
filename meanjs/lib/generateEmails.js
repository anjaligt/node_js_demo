'use strict';

var nodemailer  = require('nodemailer');
var fs          = require('fs');
var path        = require('path');
var _           = require('underscore');
// var smtpTransport = require('nodemailer-smtp-transport');

function Emailer (options, data) {

  this.options = options;
  this.data = data;

  this.send = function (cb) {
    var html = this.getHtml();
    var mailOptions = {
        to: this.data.email,
        cc: this.data.cc,
        bcc: this.data.bcc,
        from: this.data.from,
        subject: this.data.subject,
        html: html,
        generateTextFromHtml: true
    };

    /*var smtpTransport = nodemailer.createTransport('SMTP', {
      service: 'Mandrill',
      auth: {
        user: process.env.MANDRILL_USERNAME,
        pass: process.env.MANDRILL_PASSWORD
      }
    });*/

    var options = {
            host: 'smtp.mailgun.org',
            port: 25,
            auth: {
                user: 'kinder@vinfotech.org',
                pass: '852367Yl6Ude'
            }
          };

    var smtpTransport = nodemailer.createTransport(options);

    //var smtpTransport = nodemailer.createTransport();
    smtpTransport.sendMail(mailOptions, function (err) {

        if (err) {
            cb(err, null);
        } else {
            cb(null, 'done');
        }
    });
};

    this.getHtml = function () {
        var templatePath = path.join(__dirname, '/templates/' + this.options.template +'.html');
        var templateContent = fs.readFileSync(templatePath, 'utf8');
        if(this.data.email && _.isUndefined(this.data.password))
        {
            return _.template(templateContent,{subject:this.data.subject,message:this.data.text});
        }else if (_.isUndefined(this.data.password) && !(this.data.bcc))
        {
            return _.template(templateContent, {token: this.data.url  + 'v1/' + this.data.token + '/reset'});
        } else
        {
            return _.template(templateContent, {password: this.data.password});
        }

    };
}


exports = module.exports = Emailer;
