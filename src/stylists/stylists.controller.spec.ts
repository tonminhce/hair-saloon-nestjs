import { Test, TestingModule } from '@nestjs/testing';
import { StylistsController } from './stylists.controller';

describe('StylistsController', () => {
  let controller: StylistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StylistsController],
    }).compile();

    controller = module.get<StylistsController>(StylistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
