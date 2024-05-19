import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { CustomExRepository } from '../typeorm-ex.decorator';

@CustomExRepository(Restaurant)
export class OwnerIdentifyRestaurantRepository extends Repository<Restaurant> {
  async modifyRestaurantOwner(
    ownerId: number,
    inputId: number,
  ): Promise<Restaurant | CoreOutput> {
    const restaurant = await this.findOne({ where: { id: inputId } });
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant not found',
      };
    }

    if (ownerId !== restaurant.ownerId) {
      return {
        ok: false,
        error: "You can't edit a restaurant that you don't own",
      };
    }

    return restaurant;
  }
}
