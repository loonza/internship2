import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    HttpCode,
    BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthApiController {
    constructor(
        private readonly authService: AuthService,
        private readonly prisma: PrismaService,
    ) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Аутентификация пользователя' })
    @ApiBody({
        description: 'Учетные данные пользователя',
        schema: {
            type: 'object',
            properties: {
                login: { type: 'string', example: 'user123' },
                password: { type: 'string', example: 'password123' },
            },
            required: ['login', 'password'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Успешная аутентификация',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные учетные данные',
    })
    async login(
        @Body('login') login: string,
        @Body('password') password: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { login },
            });

            if (!user) {
                throw new BadRequestException('Пользователь не найден');
            }

            let passwordValid = false;
            if (user.password.startsWith('$2b$')) {
                passwordValid = await bcrypt.compare(password, user.password);
            } else {
                passwordValid = user.password === password;
            }

            if (!passwordValid) {
                throw new BadRequestException('Неверный пароль');
            }

            req.session.user = {
                id: user.id,
                login: user.login,
                firstName: user.firstName,
                lastName: user.lastName,
            };

            return res.json({
                status: 'success',
                data: {
                    id: user.id,
                    login: user.login,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Ошибка аутентификации';
            throw new BadRequestException(errorMessage);
        }
    }

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Выход из системы' })
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Успешный выход из системы',
    })
    @ApiResponse({
        status: 400,
        description: 'Ошибка при выходе из системы',
    })
    async logout(@Req() req: Request, @Res() res: Response) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error(err);
                    throw new BadRequestException('Ошибка при выходе из системы');
                }
                return res.json({
                    status: 'success',
                    message: 'Вы успешно вышли из системы'
                });
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Ошибка при выходе из системы';
            throw new BadRequestException(errorMessage);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Проверка аутентификации' })
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Текущий авторизованный пользователь',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    checkAuth(@Req() req: Request) {
        if (!req.session.user) {
            throw new BadRequestException('Пользователь не авторизован');
        }
        return {
            status: 'success',
            data: req.session.user,
        };
    }
}