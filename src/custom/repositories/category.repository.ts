import { Category } from 'src/restaurants/entities/category.entity';
import { Repository } from 'typeorm';
import { CustomExRepository } from '../typeorm-ex.decorator';

@CustomExRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    //     KOREAN Bbq -> korean bbq
    const categoryName = name.trim().toLowerCase();
    // korean bbq -> korean-bbq
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
