import { SetMetadata } from '@nestjs/common';

export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY';

export function CustomExRepository(
  entity: new (...args: any[]) => any,
): ClassDecorator {
  return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}
