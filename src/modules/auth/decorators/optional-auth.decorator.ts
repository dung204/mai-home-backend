import { SetMetadata } from '@nestjs/common';

export const OPTIONAL_AUTH_KEY = 'allowRoles';

export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH_KEY, true);
