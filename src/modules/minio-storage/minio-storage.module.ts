import { Module } from '@nestjs/common';

import { MinioStorageController } from './minio-storage.controller';
import { MinioStorageService } from './minio-storage.service';
import { MinioProvider } from './minio.provider';

@Module({
  controllers: [MinioStorageController],
  providers: [MinioProvider, MinioStorageService],
  exports: [MinioStorageService],
})
export class MinioStorageModule {}
