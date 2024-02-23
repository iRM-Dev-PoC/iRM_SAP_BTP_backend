import { Test, TestingModule } from '@nestjs/testing';
import { ShareLibService } from './share_lib.service';

describe('ShareLibService', () => {
  let service: ShareLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShareLibService],
    }).compile();

    service = module.get<ShareLibService>(ShareLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
