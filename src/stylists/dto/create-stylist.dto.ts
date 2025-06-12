import {
  $Enums,
  Prisma,
  StylistStatus,
  Gender,
  WorkType,
} from '@prisma/client';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Length,
  MaxLength,
  IsString,
} from 'class-validator';
import {
  EMAIL,
  FREE_STR,
  MIN_NAME,
  PHONE,
  STD_STR,
} from '../../utils/validateConst';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { fakerVI } from '@faker-js/faker';

export class CreateStylistDto implements Prisma.StylistUncheckedCreateInput {
  @ApiProperty({
    example: fakerVI.helpers.enumValue(StylistStatus),
  })
  @IsIn(Object.values(StylistStatus))
  status: $Enums.StylistStatus;

  @ApiProperty({
    example: fakerVI.helpers.enumValue(Gender),
  })
  @IsOptional()
  @IsIn(Object.values(Gender))
  @Transform(({ value }) => (value === '' ? null : value))
  gender?: $Enums.Gender;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(MIN_NAME, STD_STR)
  name: string;

  @ApiProperty({
    example: fakerVI.phone
      .number({ style: 'human' })
      .replaceAll(' ', '')
      .replaceAll('-', ''),
  })
  @MaxLength(PHONE)
  @Transform(({ value }) => value.replaceAll(' ', '').replaceAll('-', ''))
  phone_number: string;

  @ApiProperty({
    example: fakerVI.internet.email({ allowSpecialCharacters: false }),
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(EMAIL)
  email?: string;

  @ApiProperty({
    description: 'Date of birth of the stylist',
    example: '1990-01-01',
    format: 'YYYY-MM-DD',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return null;
    return new Date(value).toISOString();
  })
  date_of_birth?: Date;

  @ApiProperty({
    description: 'Date the stylist was hired',
    example: '2021-01-01',
    format: 'YYYY-MM-DD',
    required: false,
  })
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return null;
    return new Date(value).toISOString();
  })
  date_hired?: Date;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(STD_STR)
  position?: string;

  @IsOptional()
  @IsIn(Object.values(WorkType))
  @Transform(({ value }) => (value === '' ? null : value))
  work_type?: $Enums.WorkType;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(FREE_STR)
  living_area?: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  registered_store_id: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(FREE_STR)
  notes?: string;

  @IsOptional()
  custom_data?: Prisma.JsonValue | null;

  @ApiProperty({
    description: 'Image UUID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  image_uuid?: string | null;
}
