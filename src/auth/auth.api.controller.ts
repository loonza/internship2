import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    HttpCode,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import {Request, Response} from 'express';
import * as bcrypt from 'bcrypt';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {PrismaService} from '../prisma.service';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthApiController {
    constructor(
        private readonly authService: AuthService,
        private readonly prisma: PrismaService,
    ) {
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({summary: 'Аутентификация пользователя'})
    @ApiBody({
        description: 'Учетные данные пользователя',
        schema: {
            type: 'object',
            properties: {
                login: {type: 'string', example: 'user123'},
                password: {type: 'string', example: 'password123'},
            },
            required: ['login', 'password'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Успешная аутентификация',
        schema: {
            type: 'object',
            properties: {
                status: {type: 'string', example: 'success'},
                data: {
                    type: 'object',
                    properties: {
                        id: {type: 'string', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'},
                        login: {type: 'string', example: 'user123'},
                        firstName: {type: 'string', example: 'Иван'},
                        lastName: {type: 'string', example: 'Иванов'},
                        email: {type: 'string', example: 'user@example.com'},
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные учетные данные',
    })
    @ApiResponse({
        status: 500,
        description: 'Ошибка сервера',
    })
    async login(
        @Body('login') login: string,
        @Body('password') password: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            if (!login || !password) {
                throw new BadRequestException('Логин и пароль обязательны');
            }

            const user = await this.authService.findOneByLogin(login);

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
                email: user.email,
                department: user.department,
                division: user.division,
            };


            await new Promise<void>((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return res.json({
                status: 'success',
                data: {
                    id: user.id,
                    login: user.login,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    department: user.department,
                    division: user.division,
                },
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Ошибка аутентификации';

            if (error instanceof BadRequestException) {
                throw error;
            }

            console.error('Ошибка при аутентификации:', error);
            throw new BadRequestException(errorMessage);
        }
    }

    @Post('logout')
    @HttpCode(200)
    @ApiOperation({summary: 'Выход из системы'})
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Успешный выход из системы',
        schema: {
            type: 'object',
            properties: {
                status: {type: 'string', example: 'success'},
                message: {type: 'string', example: 'Вы успешно вышли из системы'},
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Ошибка при выходе из системы',
    })
    async logout(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.session.user) {
                throw new BadRequestException('Пользователь не авторизован');
            }

            // Уничтожаем сессию
            await new Promise<void>((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return res.json({
                status: 'success',
                message: 'Вы успешно вышли из системы'
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Ошибка при выходе из системы';

            console.error('Ошибка при выходе из системы:', error);
            throw new BadRequestException(errorMessage);
        }
    }

    @Get('check')
    @ApiOperation({summary: 'Проверка аутентификации'})
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Текущий авторизованный пользователь',
        schema: {
            type: 'object',
            properties: {
                status: {type: 'string', example: 'success'},
                data: {
                    type: 'object',
                    properties: {
                        id: {type: 'string', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'},
                        login: {type: 'string', example: 'user123'},
                        firstName: {type: 'string', example: 'Иван'},
                        lastName: {type: 'string', example: 'Иванов'},
                        email: {type: 'string', example: 'user@example.com'},
                        department: {type: 'string', example: 'IT отдел'},
                        division: {type: 'string', example: 'Разработка'},
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    checkAuth(@Req() req: Request) {
        if (!req.session.user) {
            throw new UnauthorizedException('Пользователь не авторизован');
        }

        return {
            status: 'success',
            data: req.session.user,
        };
    }

    @Get('session')
    @ApiOperation({summary: 'Получить информацию о сессии'})
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Информация о сессии',
    })
    getSessionInfo(@Req() req: Request) {
        return {
            status: 'success',
            data: {
                sessionId: req.sessionID,
                user: req.session.user,
                cookie: req.session.cookie,
            },
        };
    }
}