import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: 'http://localhost:3002', // Allow the frontend URL
    origin: [
      'https://advancefileshare.netlify.app',
      'https://689c-2402-3a80-46d0-393d-cd96-9a23-4e26-43c7.ngrok-free.app',
      'http://localhost:3002' // optional for local dev
    ],
    // methods: 'GET,POST,PUT,DELETE', // Allow these methods
    // allowedHeaders: ['Authorization', 'Content-Type'], // Allow Authorization header
    credentials: true,

  });
    await app.listen(process.env.PORT || 10000);
  console.log('file-uploader service running successfully ')
}

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   // 🔥 Serve static files from `uploads` folder
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/files/', // ✅ So files will be at http://localhost:5000/files/filename
//   });

//   await app.listen(5000);
// }
bootstrap();
