import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClientExtended } from '../src/extensions/CustomPrismaClient';

@Injectable()
export class PrismaService
  extends PrismaClientExtended
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    console.log('Initializing Prisma Service');
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
