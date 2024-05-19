import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './retaurants.service';
import { RestaurantResolver } from './restaurants.resolver';
import { CategoryRepository } from 'src/custom/repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
