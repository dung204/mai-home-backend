import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { And, DeepPartial, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { configs } from '@/base/configs';
import { RedisService } from '@/base/database';
import { BaseService, CustomFindManyOptions } from '@/base/services';
import { User } from '@/modules/users/entities/user.entity';

import {
  CreateTransactionDto,
  CreateTransactionResponseDto,
  TransactionQueryDto,
} from '../dtos/transactions.dtos';
import { Transaction } from '../entities/transaction.entity';
import { TransactionsRepository } from '../repositories/transactions.repository';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  private readonly VALIDITY_PERIOD_IN_SECONDS = 900; // 15 minutes
  private readonly PAYOS_SUCCESS_CODE = '00';
  private readonly PAYOS_PAID_STATUS = 'PAID';

  constructor(
    protected readonly repository: TransactionsRepository,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {
    const logger = new Logger(TransactionsService.name);
    super(repository, logger);
  }

  protected async preCreateOne(
    userId: string,
    createDto: any,
    _currentUser?: User,
  ): Promise<DeepPartial<Transaction>> {
    const payOSConfig = configs.PAYOS;
    const { id } = createDto;

    const res = await this.httpService.axiosRef.get(
      `https://api-merchant.payos.vn/v2/payment-requests/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': payOSConfig.clientId,
          'x-api-key': payOSConfig.apiKey,
        },
      },
    );

    const transactionStr = await this.redisService.get(`MAI_HOME_TR_${id}`, true);

    if (res.data.data.status !== this.PAYOS_PAID_STATUS || transactionStr === null) {
      throw new NotFoundException('Transaction is not available.');
    }

    const transaction = JSON.parse(transactionStr) as Transaction;

    if (transaction.user.id !== userId) {
      throw new ForbiddenException();
    }

    return {
      ...transaction,
      createTimestamp: new Date(),
    };
  }

  async createTransaction(currentUser: User, createTransactionDto: CreateTransactionDto) {
    const payOSConfig = configs.PAYOS;
    const { amount, description, cancelUrl, returnUrl } = createTransactionDto;
    const orderCode = Date.now();
    const transactionId = `MAI_HOME_TR_${orderCode}`;
    const rawSignature = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    const signature = createHmac('sha256', payOSConfig.checksumKey)
      .update(rawSignature)
      .digest('hex');

    const res = await this.httpService.axiosRef.post(
      'https://api-merchant.payos.vn/v2/payment-requests',
      {
        orderCode,
        amount,
        description,
        cancelUrl,
        returnUrl,
        signature,
        expiredAt: Math.round(orderCode / 1000) + this.VALIDITY_PERIOD_IN_SECONDS,
        buyerName: currentUser.displayName,
        buyerEmail: currentUser.account.email,
        buyerPhone: currentUser.account.phone,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': payOSConfig.clientId,
          'x-api-key': payOSConfig.apiKey,
        },
      },
    );

    if (res.data.code !== this.PAYOS_SUCCESS_CODE) {
      throw new BadRequestException(res.data.desc);
    }

    const transaction: Transaction = {
      id: transactionId,
      amount,
      user: currentUser,
      createUserId: currentUser.id,
      updateUserId: null,
      deleteUserId: null,
      createTimestamp: new Date(),
      updateTimestamp: null,
      deleteTimestamp: null,
    };

    await this.redisService.set(transactionId, JSON.stringify(transaction));

    return CreateTransactionResponseDto.fromTransaction({
      ...transaction,
      qrCode: res.data.data.qrCode,
      checkoutUrl: res.data.data.checkoutUrl,
    } as Transaction);
  }

  protected async preFind(
    options: CustomFindManyOptions<Transaction>,
    currentUser?: User,
  ): Promise<CustomFindManyOptions<Transaction>> {
    const preProcessOptions = await super.preFind(options, currentUser);
    if (preProcessOptions.queryDto) {
      const { minAmount, maxAmount } = preProcessOptions.queryDto as TransactionQueryDto;

      preProcessOptions.where = {
        ...preProcessOptions.where,
        ...(minAmount && { amount: MoreThanOrEqual(minAmount) }),
        ...(maxAmount && { amount: LessThanOrEqual(maxAmount) }),
        ...(minAmount &&
          maxAmount && { amount: And(MoreThanOrEqual(minAmount), LessThanOrEqual(maxAmount)) }),
      };
    }

    return {
      ...preProcessOptions,
      relations: {
        user: {
          account: true,
        },
      },
    };
  }
}
