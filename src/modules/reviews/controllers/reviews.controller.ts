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

import { ApiSuccessResponse } from '@/base/decorators';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { User } from '@/modules/users/entities/user.entity';

import {
  CreateReviewDto,
  ReviewQueryDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from '../dtos/reviews.dtos';
import { ReviewsService } from '../services/reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Retrieve all reviews (with metadata)',
  })
  @ApiSuccessResponse({
    schema: ReviewResponseDto,
    isArray: true,
    hasMetadata: true,
  })
  @Public()
  @Get('/:propertyId')
  async findAllReviewsByPropertyId(
    @Param('propertyId') propertyId: string,
    @Query() reviewQueryDto: ReviewQueryDto,
  ) {
    const { data: reviews, metadata } = await this.reviewsService.find({
      queryDto: reviewQueryDto,
      where: {
        propertyId,
      },
    });

    return {
      data: reviews.map((review) => ReviewResponseDto.fromReview(review)),
      metadata,
    };
  }

  @ApiOperation({
    summary: 'Create a review for a property',
  })
  @ApiSuccessResponse({
    schema: ReviewResponseDto,
  })
  @Post('/:propertyId')
  async createNewReview(
    @Param('propertyId') propertyId: string,
    @CurrentUser() currentUser: User,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.createOne(
      currentUser.id,
      {
        userId: currentUser.id,
        ...createReviewDto,
        propertyId,
      },
      currentUser,
    );
    return ReviewResponseDto.fromReview(review);
  }

  @ApiOperation({
    summary: 'Update a review for a property of the current user',
  })
  @ApiNoContentResponse({
    description: 'Review has been deleted successfully',
  })
  @Patch('/:propertyId')
  async updateReviewByPropertyId(
    @Param('propertyId') propertyId: string,
    @CurrentUser() currentUser: User,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(currentUser, updateReviewDto, {
      where: {
        propertyId,
        userId: currentUser.id,
      },
    });
  }

  @ApiOperation({
    summary: 'Delete a review for a property of the current user',
  })
  @ApiNoContentResponse({
    description: 'Review has been deleted successfully',
  })
  @Delete('/:propertyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReviewByPropertyId(
    @Param('propertyId') propertyId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.reviewsService.softDelete(currentUser, {
      where: {
        propertyId,
        userId: currentUser.id,
      },
    });
  }
}
