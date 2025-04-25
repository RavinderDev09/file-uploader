import { Module } from "@nestjs/common";
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from "./email-service.service";


@Module({
    imports: [
      MailerModule.forRoot({
        transport: {
          host: 'smtp.gmail.com', // Replace with SMTP host (e.g., smtp.gmail.com)
          port: 587,
          secure: false, // Use `true` for port 465, `false` for 587
          auth: {
            user: 'ravinderk33257191@gmail.com', // Replace with your email
            pass: 'offp brwz yngl gsrg', // Replace with your email password
          },
        },
        defaults: {
          from: '"NestJS Mailer" <your-email@example.com>', // Sender's email
        },
      }),
    ],
    providers:[
      EmailService
    ],
  })
  export class EmailServiceModule {}
  