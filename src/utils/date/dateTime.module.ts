import { Global, Module } from '@nestjs/common';
import { DateService } from './dateTime.helper';

@Global()
@Module({
  providers: [DateService],
  exports: [DateService],
})
export class DateTimeModule {}
