import {Module} from '@nestjs/common';
import {ServiceService} from './service.service';
import {ServiceController} from './service.controller';
import {PrismaService} from 'src/prisma.service';
import {ServiceApiController} from "./service.api.controller";
import {ResourceModule} from "src/resource/resource.module";
import {AccessController} from "src/service/access.controller";

@Module({
    imports: [ResourceModule],
    controllers: [ServiceController, ServiceApiController, AccessController],
    providers: [ServiceService, PrismaService],
})
export class ServiceModule {
}