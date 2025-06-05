import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationController } from './controllers/location.controller';
import { City } from './entities/city.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';
import { CitiesRepository } from './repositories/cities.repository';
import { DistrictsRepository } from './repositories/districts.repository';
import { WardsRepository } from './repositories/wards.repository';
import { CitiesService } from './services/cities.service';
import { DistrictsService } from './services/districts.service';
import { WardsService } from './services/wards.service';

@Module({
  imports: [TypeOrmModule.forFeature([City, District, Ward])],
  controllers: [LocationController],
  providers: [
    CitiesService,
    DistrictsService,
    WardsService,
    CitiesRepository,
    DistrictsRepository,
    WardsRepository,
  ],
  exports: [CitiesService, DistrictsService, WardsService],
})
export class LocationModule {}
