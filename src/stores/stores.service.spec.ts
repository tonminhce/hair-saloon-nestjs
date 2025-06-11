import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Store, StoreType } from '@prisma/client';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Decimal } from '@prisma/client/runtime/library';

describe('StoresService', () => {
  let service: StoresService;

  const mockStore: Store = {
    id: 1,
    name: 'Test Store',
    address: 'Test Address',
    businessHoursWeekdays: '9:00 AM - 7:00 PM',
    businessHoursWeekends: '9:00 AM - 7:00 PM',
    man_price: 100000,
    woman_price: 120000,
    boy_price: 80000,
    girl_price: 90000,
    next_queue_id: 1,
    seat_count: 5,
    store_type: StoreType.STREET_STORE,
    store_type_text: 'Street Store',
    area: new Decimal(100.5),
    opened_date: new Date(),
    person_in_charge1: 'John Doe',
    person_in_charge2: 'Jane Doe',
    notes: 'Test notes',
    image_uuid: 'test-uuid',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    custom_data: {},
  };

  const mockPrismaService = {
    client: {
      store: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        trash: jest.fn(),
        trashMany: jest.fn(),
        restore: jest.fn(),
      },
      stylist: {
        count: jest.fn(),
      },
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService.client)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a store', async () => {
      const createStoreDto: CreateStoreDto = {
        name: 'Test Store',
        man_price: 100000,
        woman_price: 120000,
        boy_price: 80000,
        girl_price: 90000,
        seat_count: 5,
        store_type: StoreType.STREET_STORE,
        area: 100.5,
      };

      mockPrismaService.client.store.create.mockResolvedValue(mockStore);

      const result = await service.create(createStoreDto);
      expect(result).toEqual(mockStore);
      expect(mockPrismaService.client.store.create).toHaveBeenCalledWith({
        data: createStoreDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all stores with counts when idAndNameAndSeatCountOnly is false', async () => {
      mockPrismaService.client.store.findMany.mockResolvedValue([mockStore]);
      mockPrismaService.client.stylist.count.mockResolvedValue(5);

      const result = await service.findAll(false);
      expect(result).toEqual([
        {
          ...mockStore,
          total_stylist_count: 5,
          total_active_stylist_count: 5,
        },
      ]);
    });

    it('should return only id, name and seat_count when idAndNameAndSeatCountOnly is true', async () => {
      const simplifiedStore = {
        id: mockStore.id,
        name: mockStore.name,
        seat_count: mockStore.seat_count,
      };
      mockPrismaService.client.store.findMany.mockResolvedValue([
        simplifiedStore,
      ]);

      const result = await service.findAll(true);
      expect(result).toEqual([simplifiedStore]);
    });
  });

  describe('findOne', () => {
    it('should return a store by id with counts', async () => {
      mockPrismaService.client.store.findFirst.mockResolvedValue(mockStore);
      mockPrismaService.client.stylist.count.mockResolvedValue(5);

      const result = await service.findOne(1, false);
      expect(result).toEqual({
        ...mockStore,
        total_stylist_count: 5,
        total_active_stylist_count: 5,
      });
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const updateStoreDto: UpdateStoreDto = {
        name: 'Updated Store',
      };

      const updatedStore = { ...mockStore, name: 'Updated Store' };
      mockPrismaService.client.store.update.mockResolvedValue(updatedStore);
      mockPrismaService.client.stylist.count.mockResolvedValue(5);

      const result = await service.update(1, updateStoreDto);
      expect(result).toEqual({
        ...updatedStore,
        total_stylist_count: 5,
        total_active_stylist_count: 5,
      });
    });
  });

  describe('trash', () => {
    it('should trash a store', async () => {
      mockPrismaService.client.store.trash.mockResolvedValue(mockStore);

      const result = await service.trash(1);
      expect(result).toEqual(mockStore);
      expect(mockPrismaService.client.store.trash).toHaveBeenCalledWith({
        id: 1,
      });
    });
  });
});
