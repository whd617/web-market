import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import {
  CategoryResolver,
  DishResolver,
  RestaurantResolver,
} from './restaurants.resolver';
import { CategoryRepository } from 'src/custom/repositories/category.repository';
import { TypeOrmExModule } from 'src/custom/typeorm-ex.module';
import { OwnerIdentifyRestaurantRepository } from 'src/custom/repositories/owner-identify.repository';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Dish]),
    // Custom Repository를 사용하기 위해서 아래와 같이 imports!!!***
    TypeOrmExModule.forCustomRepository([
      CategoryRepository,
      OwnerIdentifyRestaurantRepository,
    ]),
  ],
  providers: [
    RestaurantResolver,
    CategoryResolver,
    DishResolver,
    RestaurantService,
  ],
})
export class RestaurantsModule {}
