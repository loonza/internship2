import {Injectable} from '@nestjs/common';
import {CreateAuthDto} from './dto/create-auth.dto';
import {UpdateAuthDto} from './dto/update-auth.dto';
import {PrismaService} from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {
    }

    create(createAuthDto: CreateAuthDto) {
        return 'create';
    }

    findAll() {
        return `findAll`;
    }

    async findOneByLogin(login: string) {
        return this.prisma.user.findUnique({
            where: {login},
        });
    }

    async findOneById(id: string) {
        return this.prisma.user.findUnique({
            where: {id},
        });
    }

    async validateUser(login: string, password: string) {
        const user = await this.findOneByLogin(login);
        if (!user) {
            return null;
        }

        let passwordValid = false;
        if (user.password.startsWith('$2b$')) {
            passwordValid = await bcrypt.compare(password, user.password);
        } else {
            passwordValid = user.password === password;
        }

        if (!passwordValid) {
            return null;
        }

        return user;
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
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