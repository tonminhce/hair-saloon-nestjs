import { Injectable } from '@nestjs/common';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { UpdateStylistDto } from './dto/update-stylist.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomPrismaClient } from '../extensions/CustomPrismaClient';
import { AllowedModel, Stylist } from '@prisma/client';
import { removeInvalidKeyValue } from '../utils/remove-invalid-key-value.helper';

type StylistResponse = Omit<Stylist, 'date_of_birth' | 'date_hired'> & {
  date_of_birth: string | null;
  date_hired: string | null;
  store_name?: string;
};

@Injectable()
export class StylistsService {
  private prisma: CustomPrismaClient;
  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.client;
  }

  /**
   * Create a new stylist
   * @param createStylistDto - The DTO for creating a stylist
   * @param includeStoreName - Whether to include the store name in the response
   * @returns The created stylist
   */
  async create(
    createStylistDto: CreateStylistDto,
    includeStoreName: boolean,
  ): Promise<StylistResponse> {
    return this.prismaService.$transaction(async (prisma) => {
      if (createStylistDto.custom_data) {
        createStylistDto.custom_data = await removeInvalidKeyValue(
          prisma,
          AllowedModel.stylist,
          createStylistDto.custom_data,
        );
      }
      const newStylist = await prisma.stylist.create({
        data: createStylistDto,
        include: includeStoreName
          ? {
              store_id: {
                select: {
                  name: true,
                },
              },
            }
          : undefined,
      });

      if (createStylistDto.registered_store_id) {
        await prisma.store.update({
          where: { id: createStylistDto.registered_store_id },
          data: {
            stylists: {
              connect: { id: newStylist.id },
            },
          },
        });
      }
      return {
        ...newStylist,
        date_of_birth: this.formatDate(newStylist.date_of_birth),
        date_hired: this.formatDate(newStylist.date_hired),
        ...(includeStoreName
          ? {
              store_name: newStylist.store_id?.name,
              store_id: undefined,
            }
          : {}),
      };
    });
  }

  /**
   * Find all stylists
   * @param includeStoreName - Whether to include the store name in the response
   * @returns The stylists
   */
  async findAll(includeStoreName: boolean) {
    const stylists = await this.prisma.stylist.findMany({
      include: includeStoreName
        ? { store_id: { select: { name: true } } }
        : undefined,
    });
    return stylists.map((stylist) => ({
      ...stylist,
      date_of_birth: this.formatDate(stylist.date_of_birth),
      date_hired: this.formatDate(stylist.date_hired),
      ...(includeStoreName ? { store_name: stylist.store_id?.name } : {}),
    }));
  }

  /**
   * Find a stylist by ID
   * @param id - The ID of the stylist
   * @param includeStoreName - Whether to include the store name in the response
   * @param args - Additional arguments to filter the stylist
   * @returns The stylist
   */
  async findOne(
    id: number,
    includeStoreName: boolean,
    args?: { [key: string]: number | string | Date },
  ): Promise<StylistResponse | null> {
    const whereClause = { id, ...(args || {}) };
    const includeClause = includeStoreName 
      ? { store_id: { select: { name: true } } } 
      : undefined;

    const stylist = await this.prisma.stylist.findFirst({
      where: whereClause,
      include: includeClause,
    });

    if (!stylist) return null;

    return this.transformStylistResponse(stylist, includeStoreName);
  }

  // Private helper functions

  /**
   * Transform a stylist object to StylistResponse format
   * @param stylist - The stylist object from database
   * @param includeStoreName - Whether to include store name
   * @returns Transformed stylist response
   */
  private transformStylistResponse(stylist: any, includeStoreName: boolean): StylistResponse {
    const baseResponse = {
      ...stylist,
      date_of_birth: this.formatDate(stylist.date_of_birth),
      date_hired: this.formatDate(stylist.date_hired),
    };

    if (includeStoreName) {
      return {
        ...baseResponse,
        store_name: stylist.store_id?.name,
        store_id: undefined,
      };
    }

    return baseResponse;
  }

  /**
   * Format date to YYYY-MM-DD
   * @param date - The date to format
   * @returns The formatted date
   */
  private formatDate(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  }
}
