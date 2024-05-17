import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowdRoles } from './role.decorator';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    // UserRole 불러오기
    const roles = this.reflector.get<AllowdRoles>(
      'roles',
      context.getHandler(),
    );
    // UserRole이 존재하지 않으면 모두가 사용가능한 API라는 뜻
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    // user가 없으면 즉 로그인이 되어있지 않으면 false를 반환
    if (!user) {
      return false;
    }
    // roles에 Any가 반환되면 true로 반환
    if (roles.includes('Any')) {
      return true;
    }
    return roles.includes(user.role);
  }
}
