import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OrderService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrdersInput, CreateOrdersOutput } from './dtos/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(private readonly ordersService: OrderService) {}

  @Mutation((returns) => CreateOrdersOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrdersInput: CreateOrdersInput,
  ): Promise<CreateOrdersOutput> {
    return this.ordersService.createOrder(customer, createOrdersInput);
  }
}
