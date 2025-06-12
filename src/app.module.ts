import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { StylistStoresModule } from './stylist-stores/stylist-stores.module';
import { PrismaModule } from '../prisma/prisma.module';
// import { TicketsModule } from './tickets/tickets.module';
import { ConfigModule } from '@nestjs/config';
import { DateTimeModule } from './utils/date/dateTime.module';
import { MulterModule } from '@nestjs/platform-express';
// import { ImageModule } from './image/image.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaErrorInterceptor } from './interceptors/prisma-error.interceptor';
// import { SurveysModule } from './surveys/surveys.module';
import { SeederService } from './seeder/seeder.service';
// import { EventsModule } from './events/events.module';
// import { MetasModule } from './metas/metas.module';
// import { ActionsModule } from './actions/actions.module';
// import { ReportsModule } from './reports/reports.module';
// import { JobsModule } from './jobs/jobs.module';
// import { TokensModule } from './tokens/tokens.module';
// import { ZnsModule } from './zns/zns.module';
import { StoresModule } from './stores/stores.module';
import { StylistsModule } from './stylists/stylists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // StoresModule,
    // StylistsModule,
    // StylistStoresModule,
    PrismaModule,
    // TicketsModule,
    DateTimeModule,
    MulterModule.register(),
    // ImageModule,
    ScheduleModule.forRoot(),
    StoresModule,
    StylistsModule,
    // SurveysModule,
    // EventsModule,
    // MetasModule,
    // ActionsModule,
    // ReportsModule,
    // JobsModule,
    // TokensModule,
    // ZnsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrismaErrorInterceptor,
    },
    SeederService,
  ],
})
export class AppModule {}
