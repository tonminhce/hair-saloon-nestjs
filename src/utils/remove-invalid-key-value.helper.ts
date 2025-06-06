import { AllowedModel, DataType, Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export async function removeInvalidKeyValue(
  transaction_client: Prisma.TransactionClient,
  table_name: AllowedModel,
  custom_data: Prisma.JsonValue,
): Promise<Prisma.JsonValue> {
  const processedEntries = await Promise.all(
    Object.entries(custom_data).map(async ([key, value]) => {
      const meta_column = await transaction_client.meta.findUnique({
        where: {
          table_name_accessorKey: {
            table_name: table_name,
            accessorKey: key,
          },
        },
      });

      if (!meta_column) return null;

      if (
        meta_column.type === DataType.select &&
        !meta_column.editSelectOptions.includes(value)
      ) {
        throw new BadRequestException(
          `Value of ${key} is not a valid option. Could be: ${meta_column.editSelectOptions}`,
        );
      }

      return [key, value];
    }),
  );

  return Object.fromEntries(processedEntries.filter((entry) => entry != null));
}
