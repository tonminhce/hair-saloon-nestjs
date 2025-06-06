import { PrismaClient } from '@prisma/client';
import {
  filterSoftDeleted,
  restore,
  softDelete,
  softDeleteMany,
  ticketTimeExtension,
  actionTimeExtension,
} from './prisma.extensions';

export const customPrismaClient = (prismaClient: PrismaClient) => {
  return prismaClient
    .$extends(softDelete)
    .$extends(softDeleteMany)
    .$extends(filterSoftDeleted)
    .$extends(restore)
    .$extends(ticketTimeExtension)
    .$extends(actionTimeExtension);
};

export class PrismaClientExtended extends PrismaClient {
  customPrismaClient: CustomPrismaClient;

  constructor() {
    super();
  }

  get client() {
    if (!this.customPrismaClient)
      this.customPrismaClient = customPrismaClient(this);
    return this.customPrismaClient;
  }
}

export type CustomPrismaClient = ReturnType<typeof customPrismaClient>;
