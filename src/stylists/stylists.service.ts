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
  ) {
    const stylist = await this.prisma.stylist.findFirst({
      where: {
        id: id,
        ...(args || {}),
      },
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

    if (!stylist) return null;

    return {
      ...stylist,
      date_of_birth: this.formatDate(stylist.date_of_birth),
      date_hired: this.formatDate(stylist.date_hired),
      ...(includeStoreName
        ? {
            store_name: stylist.store_id?.name,
            store_id: undefined,
          }
        : {}),
    };
  }

  /**
   * Update a stylist
   * @param id - The ID of the stylist
   * @param updateStylistDto - The DTO for updating the stylist
   * @param includeStoreName - Whether to include the store name in the response
   * @returns The updated stylist
   */
  async update(
    id: number,
    updateStylistDto: UpdateStylistDto,
    includeStoreName: boolean,
  ) {
    return this.prismaService.$transaction(async (prisma) => {
      if (updateStylistDto.custom_data) {
        updateStylistDto.custom_data = await removeInvalidKeyValue(
          prisma,
          AllowedModel.stylist,
          updateStylistDto.custom_data,
        );
      }

      const updatedStylist = await prisma.stylist.update({
        where: {
          id: id,
        },
        data: updateStylistDto,
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

      return {
        ...updatedStylist,
        date_of_birth: this.formatDate(updatedStylist.date_of_birth),
        date_hired: this.formatDate(updatedStylist.date_hired),
        ...(includeStoreName
          ? {
              store_name: updatedStylist.store_id?.name,
              store_id: undefined,
            }
          : {}),
      };
    });
  }

  /**
   * Trash a stylist
   * @param id - The ID of the stylist
   * @returns The deleted stylist
   */
  async trash(id: number) {
    return this.prismaService.$transaction(async (prisma) => {
      await prisma.stylistStore.deleteMany({
        where: { stylist_id: id },
      });
      return prisma.stylist.delete({
        where: { id },
      });
    });
  }

  /**
   * Trash many stylists
   * @param id - The IDs of the stylists
   * @returns The deleted stylists
   */
  async trashMany(id: number[]) {
    return this.prismaService.$transaction(async (prisma) => {
      // First, delete any associated StylistStore records
      await prisma.stylistStore.deleteMany({
        where: { stylist_id: { in: id } },
      });

      // Then delete the stylists
      return prisma.stylist.deleteMany({
        where: {
          id: { in: id },
        },
      });
    });
  }

  /**
   * Restore a stylist
   * @param id - The ID of the stylist
   * @returns The restored stylist
   */
  async restore(id: number | number[]) {
    return await this.prisma.stylist.restore(id);
  }

  /**
   * Search for stylists
   * @param name_like - The name to search for
   * @returns The stylists
   */
  async search(name_like: string) {
    return await this.prisma.stylist.findMany({
      where: {
        name: {
          contains: name_like,
          mode: 'insensitive',
        },
      },
    });
  }
  // Private helper functions

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
