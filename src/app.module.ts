import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { ServiceModule } from './service/service.module';
import { ResourceModule } from './resource/resource.module';

@Module({
  imports: [UserModule, GroupModule, PrismaModule, AuthModule, ServiceModule, ResourceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}