import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { PrismaService } from '../prisma.service';
import {ResourceApiController} from "./resource.api.controller";

@Module({
  controllers: [ResourceController, ResourceApiController],
  providers: [ResourceService, PrismaService]
})
export class ResourceModule {}