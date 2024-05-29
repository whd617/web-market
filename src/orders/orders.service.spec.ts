import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateOrdersInput } from './dtos/create-order.dto';

jest.mock('src/users/entities/user.entity');
jest.mock('./dtos/create-order.dto');

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: MockRepository<Order>;
  let restaurantRepository: MockRepository<Restaurant>;
  let orderItemRepository: MockRepository<OrderItem>;
  let dishRepository: MockRepository<Dish>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockRepository() },
        { provide: getRepositoryToken(Restaurant), useValue: mockRepository() },
        { provide: getRepositoryToken(OrderItem), useValue: mockRepository() },
        { provide: getRepositoryToken(Dish), useValue: mockRepository() },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService); // testing Service가져오기
    restaurantRepository = module.get(getRepositoryToken(Restaurant));
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    dishRepository = module.get(getRepositoryToken(Dish));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    let customer: User;
    let createOrderInput: CreateOrdersInput;

    beforeEach(() => {
      customer = {
        email: 'bs@email.com',
        password: '123',
        verified: true,
        role: UserRole.Client,
      } as User;

      createOrderInput = {
        restaurantId: 1,
        items: [
          {
            dishId: 1,
            options: [
              { name: 'Spice Level', choice: 'Kill me' },
              { name: 'Size', choice: 'L' },
              { name: 'Pickle' },
            ],
          },
        ],
      };
    });

    /* const dishes = 
      {
        id: 1,
        name: 'Super Mexican Taco Chicken',
        price: 14,
        description: 'Delicious!',
        photo: 'dsef',
        restaurantId: 1,
        options: {
          name: 'Spice Level',
          choices: [{ name: 'Little bit' }, { name: 'Kill me' }],
        },
      }, */
    const dishes = {
      id: 1,
      price: 10,
      options: [
        {
          name: 'Spice Level',
          choices: [
            { name: 'Little bit', extra: 3 },
            { name: 'Kill me', extra: 3 },
          ],
        },
        { name: 'Pickle', extra: 1 },
        {
          name: 'Size',
          choices: [
            { name: 'S', extra: 1 },
            { name: 'L', extra: 4 },
          ],
        },
      ],
    };
    it('should fail if restaurant not found', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);
      const result = await service.createOrder(customer, createOrderInput);
      expect(result).toMatchObject({
        ok: false,
        error: 'Restaurant not found',
      });
    });

    it('should fail if dish not found', async () => {
      restaurantRepository.findOne.mockResolvedValue({
        id: 1,
      });
      dishRepository.findOne.mockResolvedValue(null);
      const result = await service.createOrder(customer, createOrderInput);
      expect(result).toEqual({
        ok: false,
        error: 'dish not found',
      });
    });

    it('should calculate the final price correctly', async () => {
      restaurantRepository.findOne.mockResolvedValue({ id: 1 });
      dishRepository.findOne.mockResolvedValue(dishes);
      const result = await service.createOrder(customer, createOrderInput);
      expect(result).toEqual({ ok: true });
      const finalPrice = dishes.price + 3 + 4 + 1; // 10 + 3 (Spice Level: Kill me) + 4 (Size: L) + 1 (Pickle)
      expect(orderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          total: finalPrice,
        }),
      );
    });
  });
});
