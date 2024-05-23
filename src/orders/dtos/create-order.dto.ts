import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class CreateOrdersInput extends PickType(Order, ['items']) {
  @Field((typd) => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrdersOutput extends CoreOutput {}
