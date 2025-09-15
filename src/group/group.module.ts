import {Module} from '@nestjs/common';
import {GroupController} from './group.controller';
import {GroupService} from './group.service';
import {PrismaService} from 'src/prisma.service';
import {GroupApiController} from "./group.api.controller";

@Module({
    controllers: [GroupController, GroupApiController],
    providers: [GroupService, PrismaService],
})
export class GroupModule {
}
