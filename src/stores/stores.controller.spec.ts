import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Store, StoreType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('StoresController', () => {
  let controller: StoresController;
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

  const mockStoresService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findWithPagination: jest.fn(),
    update: jest.fn(),
    trash: jest.fn(),
    trashMany: jest.fn(),
    restore: jest.fn(),
    get_next_queue_id: jest.fn(),
    getTotalStylistCount: jest.fn(),
    getTotalActiveStylistCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: mockStoresService,
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      jest.spyOn(service, 'create').mockResolvedValue(mockStore);

      const result = await controller.create(createStoreDto);
      expect(result).toEqual(mockStore);
      expect(service.create).toHaveBeenCalledWith(createStoreDto);
    });
  });

  describe('findWithPagination', () => {
    it('should return all stores when all=true', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockStore]);

      const result = await controller.findWithPagination(
        undefined,
        undefined,
        true,
        false,
      );
      expect(result).toEqual([mockStore]);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should return paginated stores when all=false', async () => {
      const paginatedStores = [mockStore];
      jest
        .spyOn(service, 'findWithPagination')
        .mockResolvedValue(paginatedStores);

      const result = await controller.findWithPagination(5, 0, false, false);
      expect(result).toEqual({
        data: paginatedStores,
        next_cursor: paginatedStores[0].id,
        prev_cursor: paginatedStores[0].id,
      });
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockStore);

      const result = await controller.findOne('1', false);
      expect(result).toEqual(mockStore);
      expect(service.findOne).toHaveBeenCalledWith(1, false);
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const updateStoreDto: UpdateStoreDto = {
        name: 'Updated Store',
      };

      jest.spyOn(service, 'update').mockResolvedValue({
        ...mockStore,
        name: 'Updated Store',
        total_stylist_count: 0,
        total_active_stylist_count: 0,
      });

      const result = await controller.update(1, updateStoreDto);
      expect(result.name).toBe('Updated Store');
      expect(service.update).toHaveBeenCalledWith(1, updateStoreDto);
    });
  });

  describe('trash', () => {
    it('should trash a store', async () => {
      jest.spyOn(service, 'trash').mockResolvedValue(mockStore);

      const result = await controller.trash(1);
      expect(result).toEqual(mockStore);
      expect(service.trash).toHaveBeenCalledWith(1);
    });
  });
});
