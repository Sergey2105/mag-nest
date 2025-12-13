// import VerificationEmail from '@email/confirmation.email';
// import { MailerService } from '@nestjs-modules/mailer';
// import { Injectable } from '@nestjs/common';
// import { render } from '@react-email/render';

// @Injectable()
// export class EmailService {
//   constructor(private readonly mailerService: MailerService) {}

//   sendEmail(to: string, subject: string, html: string) {
//     return this.mailerService.sendMail({
//       to,
//       subject,
//       html,
//     });
//   }

//   async sendVerification(to: string, verificationLink: string) {
//     const html = await render(VerificationEmail({ url: verificationLink }));
//     return this.sendEmail(to, 'Подтверждение почты', html);
//   }
// }

import VerificationEmail from '@email/confirmation.email';
import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(to: string, subject: string, html: string) {
    return this.resend.emails.send({
      from: process.env.EMAIL_FROM!, // например: no-reply@yourdomain.com
      to,
      subject,
      html,
    });
  }

  async sendVerification(to: string, verificationLink: string) {
    const html = await render(VerificationEmail({ url: verificationLink }));

    return this.sendEmail(to, 'Подтверждение почты', html);
  }
}
