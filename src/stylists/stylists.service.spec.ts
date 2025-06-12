import { Test, TestingModule } from '@nestjs/testing';
import { StylistsService } from './stylists.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { StylistStatus } from '@prisma/client';

describe('StylistsService', () => {
  let service: StylistsService;

  const mockPrismaService = {
    client: {
      stylist: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        restore: jest.fn(),
      },
      store: {
        update: jest.fn(),
      },
      stylistStore: {
        deleteMany: jest.fn(),
      },
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService.client)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StylistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StylistsService>(StylistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createStylistDto: CreateStylistDto = {
      status: StylistStatus.Active,
      name: 'John Doe',
      phone_number: '1234567890',
      registered_store_id: 1,
    };

    const mockStylist = {
      id: 1,
      ...createStylistDto,
      date_of_birth: null,
      date_hired: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    it('should create a stylist', async () => {
      mockPrismaService.client.stylist.create.mockResolvedValue(mockStylist);

      const result = await service.create(createStylistDto, false);

      expect(result).toEqual({
        ...mockStylist,
        date_of_birth: null,
        date_hired: null,
      });
      expect(mockPrismaService.client.stylist.create).toHaveBeenCalledWith({
        data: createStylistDto,
        include: undefined,
      });
    });
  });

  describe('findAll', () => {
    const mockStylists = [
      {
        id: 1,
        name: 'John Doe',
        status: StylistStatus.Active,
        date_of_birth: new Date('1990-01-01'),
        date_hired: new Date('2021-01-01'),
      },
    ];

    it('should return all stylists', async () => {
      mockPrismaService.client.stylist.findMany.mockResolvedValue(mockStylists);

      const result = await service.findAll(false);

      expect(result).toEqual([
        {
          ...mockStylists[0],
          date_of_birth: '1990-01-01',
          date_hired: '2021-01-01',
        },
      ]);
    });
  });

  describe('findOne', () => {
    const mockStylist = {
      id: 1,
      name: 'John Doe',
      status: StylistStatus.Active,
      date_of_birth: new Date('1990-01-01'),
      date_hired: new Date('2021-01-01'),
    };

    it('should return a single stylist', async () => {
      mockPrismaService.client.stylist.findFirst.mockResolvedValue(mockStylist);

      const result = await service.findOne(1, false);

      expect(result).toEqual({
        ...mockStylist,
        date_of_birth: '1990-01-01',
        date_hired: '2021-01-01',
      });
    });

    it('should return null if stylist not found', async () => {
      mockPrismaService.client.stylist.findFirst.mockResolvedValue(null);

      const result = await service.findOne(999, false);

      expect(result).toBeNull();
    });
  });
});
