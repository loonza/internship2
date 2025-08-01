import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAuthDto: CreateAuthDto) {
    return 'create';
  }

  findAll() {
    return `findAll`;
  }

  async findOneByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: { login },
    });
  }

  findOne(id: number) {
    return `findOne`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `update`;
  }

  remove(id: number) {
    return `remove`;
  }
}
