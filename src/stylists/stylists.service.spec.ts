import { Test, TestingModule } from '@nestjs/testing';
import { StylistsService } from './stylists.service';

describe('StylistsService', () => {
  let service: StylistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StylistsService],
    }).compile();

    service = module.get<StylistsService>(StylistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
