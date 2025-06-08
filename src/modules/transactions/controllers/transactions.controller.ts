import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';

import { ApiSuccessResponse } from '@/base/decorators';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

import {
  CreateTransactionDto,
  CreateTransactionResponseDto,
  TransactionQueryDto,
  TransactionResponseDto,
} from '../dtos/transactions.dtos';
import { TransactionsService } from '../services/transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Get all transactions of the current user',
  })
  @ApiSuccessResponse({
    schema: TransactionResponseDto,
    description: 'Retrieved all transactions successfully',
  })
  @Get('/')
  async findAllTransactions(
    @CurrentUser() currentUser: User,
    @Query() transactionQueryDto: TransactionQueryDto,
  ) {
    const { data: transactions, metadata } = await this.transactionsService.find({
      queryDto: transactionQueryDto,
      where: {
        user: currentUser,
      },
    });

    return {
      data: transactions.map((transaction) => TransactionResponseDto.fromTransaction(transaction)),
      metadata,
    };
  }

  @ApiOperation({
    summary: 'Create a transaction',
  })
  @ApiCreatedResponse({
    description: 'Transaction created successfully',
    type: CreateTransactionResponseDto,
  })
  @Post('/create')
  async createTransactions(
    @CurrentUser() currentUser: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(currentUser, createTransactionDto);
  }

  @ApiOperation({
    summary: 'Save a successful transaction to the database',
  })
  @Post('/save/:orderCode')
  async saveTransaction(@Param('orderCode') orderCode: string, @CurrentUser() currentUser: User) {
    const transaction = await this.transactionsService.createOne(
      currentUser.id,
      { id: orderCode },
      currentUser,
    );

    return TransactionResponseDto.fromTransaction(transaction);
  }
}
