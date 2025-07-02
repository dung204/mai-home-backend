import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { IsNull, Not } from 'typeorm';

import { ApiSuccessResponse } from '@/base/decorators';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { User } from '@/modules/users/entities/user.entity';

import {
  CreatePropertyDto,
  DeletedPropertyQueryDto,
  DeletedPropertyResponseDto,
  PropertyQueryDto,
  PropertyResponseDto,
  UpdatePropertyDto,
} from '../dtos/properties.dtos';
import { PropertiesService } from '../services/properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @ApiOperation({
    summary: 'Retrieve all properties (with metadata)',
  })
  @ApiSuccessResponse({
    schema: PropertyResponseDto,
    isArray: true,
    hasMetadata: true,
  })
  @Public()
  @Get('/')
  async findAllProperties(@Query() propertyQueryDto: PropertyQueryDto) {
    const { data: properties, metadata } = await this.propertiesService.find({
      queryDto: propertyQueryDto,
    });

    return {
      data: properties.map((property) => PropertyResponseDto.fromProperty(property)),
      metadata,
    };
  }

  @ApiOperation({
    summary: 'Retrieve all deleted properties of the current user (with metadata)',
  })
  @ApiSuccessResponse({
    schema: PropertyResponseDto,
    isArray: true,
    hasMetadata: true,
  })
  @Get('/deleted')
  async findAllDeletedProperties(
    @Query() deletedPropertyQueryDto: DeletedPropertyQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    const { data: properties, metadata } = await this.propertiesService.find({
      queryDto: deletedPropertyQueryDto,
      where: {
        owner: currentUser,
        deleteTimestamp: Not(IsNull()),
      },
      withDeleted: true,
    });

    return {
      data: properties.map((property) => DeletedPropertyResponseDto.fromProperty(property)),
      metadata,
    };
  }

  @ApiOperation({
    summary: 'Retrieve a property by ID',
  })
  @ApiSuccessResponse({
    schema: PropertyResponseDto,
  })
  @Public()
  @Get('/:id')
  async findPropertyById(@Param('id') id: string) {
    const property = await this.propertiesService.findOne({
      where: { id },
    });

    return PropertyResponseDto.fromProperty(property!);
  }

  @ApiOperation({
    summary: 'Create a new property',
  })
  @ApiSuccessResponse({
    schema: PropertyResponseDto,
  })
  @Post('/')
  async createNewProperty(
    @CurrentUser() currentUser: User,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    const property = await this.propertiesService.createOne(
      currentUser.id,
      createPropertyDto,
      currentUser,
    );
    return PropertyResponseDto.fromProperty(property);
  }

  @ApiOperation({
    summary: 'Update an existing property',
  })
  @ApiSuccessResponse({
    schema: PropertyResponseDto,
  })
  @Patch('/:id')
  async updateProperty(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const properties = await this.propertiesService.update(currentUser, updatePropertyDto, {
      where: {
        id,
        owner: currentUser,
      },
    });

    return PropertyResponseDto.fromProperty(properties[0]);
  }

  @ApiOperation({
    summary: 'Soft delete an existing property',
  })
  @ApiNoContentResponse({
    description: 'Soft deleted the property successfully',
  })
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDeleteProperty(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.propertiesService.softDelete(currentUser, {
      where: {
        id,
        owner: currentUser,
      },
    });
  }

  @ApiOperation({
    summary: 'Restore an existing property',
  })
  @ApiSuccessResponse({
    schema: PropertyResponseDto,
  })
  @Patch('/restore/:id')
  async restoreProperty(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const properties = await this.propertiesService.restore(currentUser, {
      where: {
        id,
        owner: currentUser,
      },
      withDeleted: true,
    });

    return PropertyResponseDto.fromProperty(properties[0]);
  }

  @Public()
  @Get('/convert/minio/images')
  covertImages() {
    return this.propertiesService.convertImages();
  }

  @Public()
  @Get('/convert/minio/videos')
  covertVideos() {
    return this.propertiesService.convertVideos();
  }
}
