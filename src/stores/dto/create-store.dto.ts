import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Prisma, $Enums } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/ar';
import { IsTimeRange } from '../../decorators/is-time-range.decorator';

import { Transform } from 'class-transformer';
import {
  FREE_STR,
  MAX_PRICE,
  SMALL_INT,
  STD_STR,
  STORE_TYPE,
} from '../../utils/validateConst';

export class CreateStoreDto {
  @ApiProperty({
    description: 'Name of the store',
    example: 'Store 1',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(3, STD_STR)
  name: string;

  @ApiProperty({
    description: 'Address of the store',
    example: '123 Main St, Anytown, USA',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(3, STD_STR)
  address?: string | null;

  @ApiProperty({
    description: 'Business hours week days of the store',
    example: '9:00 AM - 7:00 PM',
  })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsTimeRange({
    message:
      'Business hours weekdays must be in format "HH:MM AM/PM - HH:MM AM/PM". For example, 9:00 AM - 7:00 PM ',
  })
  businessHoursWeekdays?: string | null;

  @ApiProperty({
    description: 'Business hours weekends of the store',
    example: '9:00 AM - 7:00 PM',
  })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsTimeRange({
    message:
      'Business hours weekends must be in format "HH:MM AM/PM - HH:MM AM/PM". For example, 9:00 AM - 7:00 PM ',
  })
  businessHoursWeekends?: string | null;

  @ApiProperty({
    description: 'Price for men',
    example: 100000,
  })
  @IsNumber()
  @Max(MAX_PRICE)
  man_price: number;

  @ApiProperty({
    description: 'Price for women',
    example: 500000,
  })
  @Max(MAX_PRICE)
  @IsNumber()
  woman_price: number;

  @ApiProperty({
    description: 'Price for boys',
    example: 10000,
  })
  @Max(MAX_PRICE)
  @IsNumber()
  boy_price: number;

  @ApiProperty({
    description: 'Price for girls',
    example: 20000,
  })
  @Max(MAX_PRICE)
  @IsNumber()
  girl_price: number;

  @ApiProperty({
    description: 'Next queue ID',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Max(SMALL_INT)
  next_queue_id?: number;

  @ApiProperty({
    description: 'Seat count of the store',
    example: 10,
  })
  @IsNumber()
  @Max(999)
  seat_count: number;

  @ApiProperty({
    description: 'Type of the store',
    example: faker.helpers.arrayElement(STORE_TYPE),
    enum: STORE_TYPE,
  })
  @IsIn(STORE_TYPE)
  store_type: $Enums.StoreType;

  @ApiProperty({
    description: 'Additional type information (optional)',
    example: 'Store on 3rd Floor of Nguyen Hue Street',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  store_type_text?: string | null;

  @ApiProperty({
    description: 'Area of the store in square meters (optional)',
    example: 300.5,
    required: true,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Max(999.99)
  area: number | null;

  @ApiProperty({
    description: 'The first date of the hair salon',
    example: '2024-12-15T00:00:00.000Z',
    format: 'ISO 8601',
    required: false,
  })
  @IsDateString({ strict: true })
  opened_date?: Date | null;

  @ApiProperty({
    description: 'Person in charge 1 (optional)',
    example: 'John Smith',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(STD_STR)
  person_in_charge1?: string | null;

  @ApiProperty({
    description: 'Person in charge 2 (optional)',
    example: 'Jane Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(STD_STR)
  person_in_charge2?: string | null;

  @ApiProperty({
    description: 'Notes about the store (optional)',
    example: 'Currently shutdown, due to COVID-19',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(FREE_STR)
  notes?: string | null;

  @ApiProperty({
    description: 'Image UUID (optional)',
    example: '8f6b9e4c-7d2a-4e1b-9c3f-2b5d8a7e0f9c',
    required: false,
  })
  @IsOptional()
  image_uuid?: string | null;

  @IsOptional()
  custom_data?: Prisma.JsonValue | null;
}
