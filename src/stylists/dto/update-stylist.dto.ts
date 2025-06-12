import { PartialType } from '@nestjs/swagger';
import { CreateStylistDto } from './create-stylist.dto';

export class UpdateStylistDto extends PartialType(CreateStylistDto) {}
