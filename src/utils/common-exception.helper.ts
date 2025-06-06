import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { exceptionConfig } from '../config/exception.config';

export function PrismaNotFoundException(resource_name: string) {
  return new PrismaClientKnownRequestError('', {
    code: 'P2025',
    meta: {
      cause: resource_name + ' not found',
    },
    clientVersion: exceptionConfig.client_version,
  });
}

export function PrismaColumnNotFoundException(column_name: string) {
  return new PrismaClientKnownRequestError('', {
    code: 'P2022',
    meta: {
      column: '`' + column_name + '`',
    },
    clientVersion: exceptionConfig.client_version,
  });
}
