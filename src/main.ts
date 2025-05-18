import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
  origin: '*', // or restrict it to frontend domain
});

    await app.listen(process.env.PORT || 3000     );
  console.log( await app.getUrl(),'file-uploader service running successfully ')
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
