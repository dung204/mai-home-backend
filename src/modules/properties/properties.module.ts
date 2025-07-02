import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationModule } from '../location/location.module';
import { MediaModule } from '../media';
import { PropertiesController } from './controllers/properties.controller';
import { Property } from './entities/property.entity';
import { PropertiesRepository } from './repositories/properties.repository';
import { PropertiesService } from './services/properties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Property]), LocationModule, MediaModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesRepository],
  exports: [PropertiesService],
})
export class PropertiesModule {}
