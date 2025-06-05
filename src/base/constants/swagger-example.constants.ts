import { Role } from '@/modules/auth/enums/role.enum';

import { StringUtils } from '../utils';

export const SwaggerExamples = {
  FULLNAME: 'John Doe',
  EMAIL: 'email@example.com',
  PHONE: '0912345678',
  PASSWORD: 'password@123456',
  UUID: '9efdce14-b81e-4d03-ad6e-cf95f64667fa',
  JWT_ACCESS_TOKEN:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZWZkY2UxNC1iODFlLTRkMDMtYWQ2ZS1jZjk1ZjY0NjY3ZmEifQ.JUZkSX-7jF9TAZXjE7Eh5MS8zRcrhCvoiLYp2NrhZZs',
  JWT_REFRESH_TOKEN:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZWZkY2UxNC1iODFlLTRkMDMtYWQ2ZS1jZjk1ZjY0NjY3ZmEifQ.I_6pMfuFDeLXbZOhyTddcNdpEQ_X9DkXjoGEOAKCmxs',
  ROLE: Role.USER,
  DATE_FROM: '2025-01-01T00:00:00Z',
  DATE_TO: '2025-12-31T23:59:59Z',
  ORDER_VALUE: 'createTimestamp:DESC',
  ORDER_FIELD: 'createTimestamp',
  ORDER_DIRECTION: 'DESC',
  CITY_ID: '01',
  DISTRICT_ID: '003',
  WARD_ID: '00091',
  LATITUDE: (Math.random() * 180 - 90).toFixed(8),
  LONGITUDE: (Math.random() * 360 - 180).toFixed(8),
  PRICE: Math.floor(Math.random() * (5_000_000 - 500_000 + 1)) + 500_000,
  AREA: (Math.random() * (100 - 10) + 10).toFixed(1),
  URL: 'https://example.com',
  TITLE: StringUtils.generateRandomString({
    count: 1,
    units: 'sentences',
    sentenceLowerBound: 6,
    sentenceUpperBound: 16,
  }),
  DESCRIPTION: StringUtils.generateRandomString({
    count: 1,
    units: 'sentences',
    sentenceLowerBound: 10,
    sentenceUpperBound: 800,
  }),
  ADDRESS: StringUtils.generateRandomString({
    count: 1,
    units: 'sentences',
    sentenceLowerBound: 4,
    sentenceUpperBound: 10,
  }),
};
