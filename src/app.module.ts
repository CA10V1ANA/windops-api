import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AssetsModule } from './assets/assets.module.js';
import { AlertsModule } from './alerts/alerts.module.js';

@Module({
  imports: [AssetsModule, AlertsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
