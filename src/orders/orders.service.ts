import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrdersInput, CreateOrdersOutput } from './dtos/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { items, restaurantId }: CreateOrdersInput,
  ): Promise<CreateOrdersOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // orderFinalPrice: 모든 dish의 총 합계
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });

        if (!dish) {
          return {
            ok: false,
            error: 'dish not found',
          };
        }
        // dish 초기값 설정
        let dishFinalPrice = dish.price;
        // Order Item이 들어갈 빈 OrderItem array typ 설정
        for (const itemOptions of item.options) {
          const dishOption = dish.options.find((dishOption) => {
            dishOption.name === itemOptions.name;
          });
          if (dishOption) {
            if (dishOption.extra) {
              // extra를 찾을 때마다 dishFinalPrice에 추가
              dishFinalPrice += dishFinalPrice;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOptions.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice += dishFinalPrice;
                }
              }
            }
          }
        }
        orderFinalPrice += dishFinalPrice;

        await this.orderItems.save(
          this.orderItems.create({ dish, options: item.options }),
        );
      }
      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create order',
      };
    }
  }
}
