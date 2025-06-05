import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiResponseSchemaHost, getSchemaPath } from '@nestjs/swagger';

import { SwaggerExamples } from '../constants';
import { PaginationDto } from '../dtos/pagination.dto';

type ApiSuccessResponseOptions<DataDto extends Type<unknown>> = Omit<
  ApiResponseSchemaHost,
  'schema'
> & {
  schema: DataDto;
  isArray?: boolean;
  hasMetadata?: boolean;
};

export const ApiSuccessResponse = <DataDto extends Type<any>>({
  schema,
  hasMetadata = false,
  isArray = false,
  status = 200,
  ...options
}: ApiSuccessResponseOptions<DataDto>) => {
  return applyDecorators(
    ApiExtraModels(PaginationDto, schema),
    ApiResponse({
      status,
      ...options,
      schema: {
        properties: {
          data: {
            ...(isArray
              ? {
                  type: 'array',
                  items: { $ref: getSchemaPath(schema) },
                }
              : {
                  $ref: getSchemaPath(schema),
                }),
          },
          ...(hasMetadata && {
            metadata: {
              type: 'object',
              properties: {
                pagination: {
                  $ref: getSchemaPath(PaginationDto),
                },
                filter: {
                  type: 'object',
                  properties: {
                    fromCreateTimestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: SwaggerExamples.DATE_FROM,
                      description: 'The start createTimestamp to filter',
                    },
                    toCreateTimestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: SwaggerExamples.DATE_TO,
                      description: 'The end createTimestamp to filter',
                    },
                  },
                },
                order: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        description: 'The field to sort',
                        example: SwaggerExamples.ORDER_FIELD,
                      },
                      direction: {
                        description: 'The direction to sort',
                        example: SwaggerExamples.ORDER_DIRECTION,
                      },
                    },
                  },
                },
              },
            },
          }),
        },
      },
    }),
  );
};
