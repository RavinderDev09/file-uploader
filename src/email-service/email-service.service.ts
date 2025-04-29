// src/mail/mail.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {


  constructor(  private readonly mailerService: MailerService
  ) {
    
  }

  async sendResetPasswordEmail(email: string, resetLink: string) {
    console.log('emailDAta', email, resetLink);    
    const mailOptions = {
      from: '"BullShit" <ravinderk33257191@gmail.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    return await this.mailerService.sendMail(mailOptions);
  }


  //

  async sendOtp(email: string, otp: string) {
    console.log('emailDAta', email, otp);    
    const mailOptions = {
      ffrom: '"Secure Auth" <your.email@gmail.com>',
      to: email,
      subject: 'Verify your email - OTP',
      html: `<h3>Your OTP is: <b>${otp}</b></h3>`
    };

    return await this.mailerService.sendMail(mailOptions);
  }

  
}
