import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Make Prisma service available globally
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
