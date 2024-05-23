import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrdersInput, CreateOrdersOutput } from './dtos/create-order.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async createOrder(
    customer: User,
    createOrderInput: CreateOrdersInput,
  ): Promise<CreateOrdersOutput> {
    try {
    } catch {
      return {
        ok: false,
        error: 'Could not create order',
      };
    }
  }
}
