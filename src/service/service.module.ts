import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { PrismaService } from 'src/prisma.service';
import {ServiceApiController} from "./service.api.controller";

@Module({
  controllers: [ServiceController, ServiceApiController],
  providers: [ServiceService, PrismaService],
})
export class ServiceModule {}