import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { TaskStepsModule } from './task-steps/task-steps.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AiModule } from './ai/ai.module.js';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),

        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),

    UsersModule,

    TasksModule,

    TaskStepsModule,

    AuthModule,
  AuthModule,
AiModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
