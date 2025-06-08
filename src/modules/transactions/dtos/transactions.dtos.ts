import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Max, MaxLength, Min } from 'class-validator';

import { SwaggerExamples } from '@/base/constants';
import { OrderParams } from '@/base/decorators';
import { QueryDto } from '@/base/dtos';
import { UserProfileDto } from '@/modules/users/dtos/user.dtos';
import { User } from '@/modules/users/entities/user.entity';

import { Transaction } from '../entities/transaction.entity';

@Exclude()
export class CreateTransactionResponseDto {
  @ApiProperty({
    description: 'The ID of the transaction',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'The user who performs the transaction',
    type: UserProfileDto,
  })
  @Transform(({ value }) => UserProfileDto.fromUser(value as User))
  @Expose()
  user!: UserProfileDto;

  @ApiProperty({
    description: 'The money amount of the transaction',
    example: SwaggerExamples.PRICE,
  })
  @Expose()
  amount!: number;

  @ApiProperty({
    description: 'The created timestamp of the transaction',
    example: '2024-07-04T06:10:02.679Z',
  })
  @Expose()
  createTimestamp!: Date;

  @ApiProperty({
    description: 'The QRCode in plain text format',
    example: SwaggerExamples.QRCODE,
  })
  @Expose()
  qrCode!: string;

  @ApiProperty({
    description: 'The URL which user can enter and perform the checkout',
    example: SwaggerExamples.URL,
  })
  @Expose()
  checkoutUrl!: string;

  public static fromTransaction(transaction: Transaction) {
    return plainToInstance(CreateTransactionResponseDto, transaction);
  }
}

@Exclude()
export class TransactionResponseDto extends OmitType(CreateTransactionResponseDto, [
  'checkoutUrl',
  'qrCode',
]) {
  public static fromTransaction(transaction: Transaction) {
    return plainToInstance(TransactionResponseDto, transaction);
  }
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The money amount of the transaction',
    example: SwaggerExamples.PRICE,
  })
  @IsInt()
  @Min(1000)
  @Max(50_000_000)
  @Transform(({ value }) => parseInt(value as string))
  amount!: number;

  @ApiProperty({
    description: 'The description for the transaction',
    example: SwaggerExamples.TITLE,
  })
  @IsNotEmpty()
  @MaxLength(25)
  description!: string;

  @ApiProperty({
    description: 'The URL that redirects the user after the transaction is finished',
    example: SwaggerExamples.URL,
  })
  returnUrl!: string;

  @ApiProperty({
    description: 'The URL that redirects the user when the transaction is cancelled',
    example: SwaggerExamples.URL,
  })
  cancelUrl!: string;
}

export class TransactionQueryDto extends QueryDto {
  @OrderParams(['createTimestamp', 'amount'])
  order: string[] = [];

  @ApiProperty({
    description: 'Min money amount to filter',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @Min(1000)
  @Max(50_000_000)
  @Transform(({ value }) => parseInt(value as string))
  minAmount?: number;

  @ApiProperty({
    description: 'Min money amount to filter',
    example: 500_000,
    required: false,
  })
  @IsOptional()
  @Min(1000)
  @Max(50_000_000)
  @Transform(({ value }) => parseInt(value as string))
  maxAmount?: number;
}
