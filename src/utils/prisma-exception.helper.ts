import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaClientValidationError } from '@prisma/client/runtime/binary';

export function handlePrismaError(error: unknown): never {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2000':
        throw new BadRequestException(
          "The provided value for the column is too long for the column's " +
            `type. Column: ${error.meta['column_name']}`,
        );
      case 'P2001':
        throw new BadRequestException(
          `The record searched for in the where condition (${error.meta['model_name']}.${error.meta['argument_name']} = ${error.meta['argument_value']}) does not exist`,
        );
      case 'P2002':
        throw new ConflictException(
          `Unique constraint failed on the ${error.meta['constraint']}`,
        );
      case 'P2003':
        throw new ConflictException(
          `Foreign key constraint failed on the field: ${error.meta['field_name']}`,
        );
      case 'P2004':
        throw new BadRequestException(
          `A constraint failed on the database: ${error.meta['database_error']}`,
        );
      case 'P2005':
        throw new BadRequestException(
          `The value ${error.meta['field_value']} stored in the database for the field ${error.meta['field_name']} is invalid for the field's type`,
        );
      case 'P2006':
        throw new BadRequestException(
          `The provided value ${error.meta['field_value']} for ${error.meta['model_name']} field ${error.meta['field_name']} is not valid`,
        );
      case 'P2007':
        throw new BadRequestException(
          `Data validation error ${error.meta['database_error']}`,
        );
      case 'P2008':
        throw new BadRequestException(
          `Failed to parse the query ${error.meta['query_parsing_error']} at ${error.meta['query_position']}`,
        );
      case 'P2009':
        throw new BadRequestException(
          `Failed to validate the query: ${error.meta['query_validation_error']} at ${error.meta['query_position']}`,
        );
      case 'P2010':
        throw new BadRequestException(
          `Raw query failed. Code: ${error.meta['code']}. Message: ${error.meta['message']}`,
        );
      case 'P2011':
        throw new BadRequestException(
          `Null constraint violation on the ${error.meta['constraint']}`,
        );
      case 'P2012':
        throw new BadRequestException(
          `Missing a required value at ${error.meta['path']}`,
        );
      case 'P2013':
        throw new BadRequestException(
          `Missing the required argument ${error.meta['argument_name']} for field ${error.meta['field_name']} on ${error.meta['object_name']}.`,
        );
      case 'P2014':
        throw new ConflictException(
          `The change you are trying to make would violate the required relation '${error.meta['relation_name']}' between the ${error.meta['model_a_name']} and ${error.meta['model_b_name']} models.`,
        );
      case 'P2015':
        throw new NotFoundException(
          `A related record could not be found. ${error.meta['details']}`,
        );
      case 'P2016':
        throw new BadRequestException(
          `Query interpretation error. ${error.meta['details']}`,
        );
      case 'P2017':
        throw new ConflictException(
          `The records for relation ${error.meta['relation_name']} between the ${error.meta['parent_name']} and ${error.meta['child_name']} models are not connected.`,
        );
      case 'P2018':
        throw new NotFoundException(
          `The required connected records were not found. ${error.meta['details']}`,
        );
      case 'P2019':
        throw new BadRequestException(`Input error. ${error.meta['details']}`);
      case 'P2020':
        throw new BadRequestException(
          `Value out of range for the type. ${error.meta['details']}`,
        );
      case 'P2021':
        throw new NotFoundException(
          `The table ${error.meta['table']} does not exist in the current database.`,
        );
      case 'P2022':
        throw new NotFoundException(
          `The column ${error.meta['column']} does not exist in the current database.`,
        );
      case 'P2023':
        throw new BadRequestException(
          `Inconsistent column data: ${error.meta['message']}`,
        );
      case 'P2024':
        throw new GatewayTimeoutException(
          `Timed out fetching a new connection from the connection pool. (More info: http://pris.ly/d/connection-pool (Current connection pool timeout: ${error.meta['timeout']}, connection limit: ${error.meta['connection_limit']}))`,
        );
      case 'P2025':
        throw new NotFoundException(
          `An operation failed because it depends on one or more records that were required but not found. ${error.meta['cause']}`,
        );
      case 'P2026':
        throw new BadRequestException(
          `The current database provider doesn't support a feature that the query used: ${error.meta['feature']}`,
        );
      case 'P2027':
        throw new BadRequestException(
          `Multiple errors occurred on the database during query execution: ${error.meta['errors']}`,
        );
      case 'P2028':
        throw new BadRequestException(
          `Transaction API error: ${error.meta['error']}`,
        );
      case 'P2029':
        throw new BadRequestException(
          `Query parameter limit exceeded error: ${error.meta['message']}`,
        );
      case 'P2030':
        throw new BadRequestException(
          `Cannot find a fulltext index to use for the search, try adding a @@fulltext([Fields...]) to your schema`,
        );
      case 'P2031':
        throw new ServiceUnavailableException(
          `Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set. See details: https://pris.ly/d/mongodb-replica-set`,
        );
      case 'P2033':
        throw new BadRequestException(
          `A number used in the query does not fit into a 64 bit signed integer. Consider using BigInt as field type if you're trying to store large integers`,
        );
      case 'P2034':
        throw new ConflictException(
          `Transaction failed due to a write conflict or a deadlock. Please retry your transaction`,
        );
      case 'P2035':
        throw new BadRequestException(
          `Assertion violation on the database: ${error.meta['database_error']}`,
        );
      case 'P2036':
        throw new BadRequestException(
          `Error in external connector (id ${error.meta['id']})`,
        );
      case 'P2037':
        throw new ServiceUnavailableException(
          `Too many database connections opened: ${error.meta['message']}`,
        );
    }
  }

  if (
    error instanceof PrismaClientValidationError ||
    error['name'] === 'PrismaClientValidationError'
  ) {
    throw new BadRequestException(
      `Validation error: ${error['message'].substring(error['message'].lastIndexOf('\n') + 1)}`,
    );
  }

  throw error;
}
