import { Module } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentResolver } from './payments.resolver';
import { PaymentsService } from './payments.service';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { PaymentsController } from './payments.constoller';

@Module({
  controllers: [PaymentsController],
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentResolver, PaymentsService],
})
export class PaymentsModule {}
