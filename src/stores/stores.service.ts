import { Injectable } from '@nestjs/common';
import { CustomPrismaClient } from '../extensions/CustomPrismaClient';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { removeInvalidKeyValue } from '../utils/remove-invalid-key-value.helper';
import { AllowedModel, Store, StylistStatus } from '@prisma/client';

type StoreWithStylistCount = Store & {
  total_stylist_count: number;
  total_active_stylist_count: number;
};

type StoreWithNameAndSeatCount = Pick<Store, 'id' | 'name' | 'seat_count'>;

@Injectable()
export class StoresService {
  private prisma: CustomPrismaClient;
  constructor(private prismaService: PrismaService) {
    this.prisma = this.prismaService.client;
  }
  /**
   * Create a new store
   * @param createStoreDto - The data for the new store
   * @returns The created store
   */
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = await this.prismaService.$transaction(async (prisma) => {
      if (createStoreDto.custom_data) {
        createStoreDto.custom_data = await removeInvalidKeyValue(
          prisma,
          AllowedModel.store,
          createStoreDto.custom_data,
        );
      }
      const newstore = await prisma.store.create({ data: createStoreDto });
      return newstore;
    });
    return store;
  }

  /**
   * Get all stores
   * @param idAndNameAndSeatCountOnly - Whether to return only basic fields
   * @returns The stores
   */
  async findAll(
    idAndNameAndSeatCountOnly?: boolean,
  ): Promise<StoreWithNameAndSeatCount[] | StoreWithStylistCount[]> {
    if (idAndNameAndSeatCountOnly) {
      return this.prisma.store.findMany({
        select: {
          id: true,
          name: true,
          seat_count: true,
        },
        orderBy: { id: 'asc' },
      });
    }

    const stores = await this.prisma.store.findMany({
      orderBy: { id: 'asc' },
    });
    return await Promise.all(
      stores.map(async (store) => ({
        ...store,
        total_stylist_count: await this.getTotalStylistCount(store.id),
        total_active_stylist_count: await this.getTotalActiveStylistCount(
          store.id,
        ),
      })),
    );
  }

  /**
   * Get a store by ID
   * @param id - The ID of the store
   * @param idAndNameAndSeatCountOnly - Whether to return only basic fields
   * @returns The store
   */
  async findOne(
    id: number,
    idAndNameAndSeatCountOnly?: boolean,
  ): Promise<StoreWithNameAndSeatCount | StoreWithStylistCount> {
    if (idAndNameAndSeatCountOnly) {
      return this.prisma.store.findFirst({
        where: { id },
        select: {
          id: true,
          name: true,
          seat_count: true,
        },
      });
    }

    const store = await this.prisma.store.findFirst({ where: { id } });
    if (!store) return null;

    return {
      ...store,
      total_stylist_count: await this.getTotalStylistCount(store.id),
      total_active_stylist_count: await this.getTotalActiveStylistCount(
        store.id,
      ),
    };
  }

  /**
   * Get stores with cursor-based pagination
   * @param take - Number of records to fetch (positive for forward, negative for backward)
   * @param cursor - The cursor ID to start from
   * @param idAndNameAndSeatCountOnly - Whether to return only basic fields
   */
  async findWithPagination(
    take: number,
    cursor: number,
    idAndNameAndSeatCountOnly?: boolean,
  ): Promise<Store[] | StoreWithNameAndSeatCount[]> {
    const storeExists = await this._checkIfStoreExists(cursor);

    if (!storeExists) {
      const nextCursor = await this._findNextAvailableCursor(cursor, take);
      if (!nextCursor) return [];

      return this._fetchStores({
        take,
        skip: 0,
        cursor: nextCursor,
        idAndNameAndSeatCountOnly,
      });
    }

    return this._fetchStores({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor && cursor !== 0 ? { id: cursor } : undefined,
      idAndNameAndSeatCountOnly,
    });
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    return this.prismaService.$transaction(async (prisma) => {
      if (updateStoreDto.custom_data) {
        updateStoreDto.custom_data = await removeInvalidKeyValue(
          prisma,
          AllowedModel.store,
          updateStoreDto.custom_data,
        );
      }

      const updatedStore = await prisma.store.update({
        where: {
          id: id,
        },
        data: updateStoreDto,
      });

      return {
        ...updatedStore,
        total_stylist_count: await this.getTotalStylistCount(id),
        total_active_stylist_count: await this.getTotalActiveStylistCount(id),
      };
    });
  }

  async trash(id: number) {
    return this.prisma.store.trash({
      id: id,
    });
  }

  async trashMany(id: number[]) {
    return this.prisma.store.trashMany({
      id: { in: id },
    });
  }

  async restore(id: number | number[]) {
    return this.prisma.store.restore(id);
  }

  async get_next_queue_id(store_id: number): Promise<number | null> {
    return this.prisma.store
      .findUnique({
        where: { id: store_id },
        select: { next_queue_id: true },
      })
      .then((store) => (store ? store.next_queue_id : null));
  }

  async getTotalStylistCount(storeId: number): Promise<number> {
    // Get data with no soft delete
    return this.prisma.stylist.count({
      where: {
        registered_store_id: storeId,
        deleted_at: null,
      },
    });
  }

  async getTotalActiveStylistCount(storeId: number): Promise<number> {
    // Get data with no soft delete
    return this.prisma.stylist.count({
      where: {
        registered_store_id: storeId,
        status: StylistStatus.Active,
        deleted_at: null,
      },
    });
  }

  /*
   * Private helper functions
   */

  /**
   * Check if a store with the given ID exists
   */
  private async _checkIfStoreExists(storeId: number): Promise<boolean> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });
    return !!store;
  }

  /**
   * Find the next available cursor based on pagination direction
   */
  private async _findNextAvailableCursor(
    cursor: number,
    take: number,
  ): Promise<{ id: number } | null> {
    const isForwardPagination = take >= 0;

    if (isForwardPagination) {
      //find next store with ID greater than cursor
      return this.prisma.store.findFirst({
        where: { id: { gt: cursor } },
        select: { id: true },
        orderBy: { id: 'asc' },
      });
    } else {
      //find previous store with ID less than cursor
      return this.prisma.store.findFirst({
        where: { id: { lt: cursor } },
        select: { id: true },
        orderBy: { id: 'desc' },
      });
    }
  }

  /**
   * Fetch stores with the given parameters
   */
  private async _fetchStores(params: {
    take: number;
    skip: number;
    cursor?: { id: number };
    idAndNameAndSeatCountOnly?: boolean;
  }): Promise<Store[] | StoreWithNameAndSeatCount[]> {
    const { take, skip, cursor, idAndNameAndSeatCountOnly } = params;

    return this.prisma.store.findMany({
      take,
      skip,
      cursor,
      select: idAndNameAndSeatCountOnly
        ? {
            id: true,
            name: true,
            seat_count: true,
          }
        : undefined,
      orderBy: { id: 'asc' },
    });
  }
}
