import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller.js';
import { AssetsModule } from '../assets/assets.module.js';

@Module({
  imports: [AssetsModule],
  controllers: [AlertsController],
})
export class AlertsModule {}
