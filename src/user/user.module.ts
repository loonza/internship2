import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import {UserApiController} from "./user.api.controller";

@Module({
  controllers: [UserController, UserApiController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
