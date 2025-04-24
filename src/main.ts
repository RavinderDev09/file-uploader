import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3002', // Allow the frontend URL
    methods: 'GET,POST,PUT,DELETE', // Allow these methods
    allowedHeaders: 'Content-Type, Authorization', // Allow Authorization header
  });
 
  await app.listen(process.env.PORT ?? 5000);
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
