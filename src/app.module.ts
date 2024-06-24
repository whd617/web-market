import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Payment } from './payments/entities/payment.entity';
import { TypeOrmExModule } from './custom/typeorm-ex.module';
import { CategoryRepository } from './custom/repositories/category.repository';
import { OwnerIdentifyRestaurantRepository } from './custom/repositories/owner-identify.repository';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtModule } from './jwt/jwt.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OrdersModule } from './orders/orders.module';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { Context } from 'apollo-server-core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'production', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_BASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        AWS_DEFAULT_ACL: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE: Joi.string().required(),
        AWS_SDK_LOAD_CONFIG: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_BUCKET: Joi.string().required(),
        AWS_ACL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_BASE,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    TypeOrmExModule.forCustomRepository([
      CategoryRepository,
      OwnerIdentifyRestaurantRepository,
    ]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      // Subscription WebSocket 통신시 사용
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context;
            extra.token = connectionParams['x-jwt'];
            console.log('extraToken -킁크랴ㅣㅌ', extra.token);
          },
        },
      },
      // Http 통신시 사용
      context: ({ req, extra }) => {
        return { token: req ? req.headers['x-jwt'] : extra.token };
      },
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
      domain: process.env.MAILGUN_DOMAIN_NAME,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
    UploadsModule.forRoot({
      AWS_DEFAULT_ACL: process.env.AWS_DEFAULT_ACL,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE:
        process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE,
      AWS_SDK_LOAD_CONFIG: process.env.AWS_SDK_LOAD_CONFIG,
      AWS_REGION: process.env.AWS_REGION,
      AWS_BUCKET: process.env.AWS_BUCKET,
      AWS_ACL: process.env.AWS_ACL,
    }),
  ],
  controllers: [],
  providers: [],
})

// Jwt Middleware 설정하기(인증처리) X
export class AppModule {}
