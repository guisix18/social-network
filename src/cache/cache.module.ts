import { Module } from '@nestjs/common';
import { CacheManagementService } from './cache.service';

@Module({
  providers: [CacheManagementService],
  exports: [CacheManagementService],
})
export class CacheManagementModule {}
