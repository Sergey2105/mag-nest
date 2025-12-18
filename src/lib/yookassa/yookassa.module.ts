import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YookassaService } from './yookassa.service';

@Module({
  imports: [HttpModule.register({}), ConfigModule],
  providers: [YookassaService],
  exports: [YookassaService, HttpModule],
})
export class YookassaModule {}
