import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

// user.entity.ts의 enum UserRole의 값을 가져와 decorator에 적용하는 방법
export type AllowdRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowdRoles[]) => SetMetadata('roles', roles);
