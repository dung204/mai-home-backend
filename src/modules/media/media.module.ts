import { Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

import { configs } from '@/base/configs';
import { MediaController } from '@/modules/media/controllers';
import { MediaService } from '@/modules/media/services';

@Module({
  controllers: [MediaController],
  providers: [
    {
      provide: 'CLOUDINARY',
      useFactory: () => cloudinary.config(configs.CLOUDINARY),
    },
    MediaService,
  ],
  exports: [MediaService],
})
export class MediaModule {}
