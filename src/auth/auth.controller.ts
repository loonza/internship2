import {Controller, Post, Get, Body, Req, Res} from '@nestjs/common';
import {Request, Response} from 'express';
import * as bcrypt from 'bcrypt';
import {PrismaService} from '../prisma.service';
import {ApiExcludeController} from "@nestjs/swagger";

@ApiExcludeController()
@Controller('auth')
export class AuthController {
    constructor(private prisma: PrismaService) {
    }

    @Get()
    async getPage(@Req() req: Request, @Res() res: Response) {
        const error = req.session.error;
        delete req.session.error;
        res.render('auth', {error});
    }

    @Post('login')
    async login(
        @Body('login') login: string,
        @Body('password') password: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {login},
            });

            if (!user) {
                req.session.error = 'Пользователь не найден';
                return res.redirect('/auth');
            }

            let passwordValid = false;
            if (user.password.startsWith('$2b$')) {
                passwordValid = await bcrypt.compare(password, user.password);
            } else {
                passwordValid = user.password === password;
            }

            if (!passwordValid) {
                req.session.error = 'Неверный пароль';
                return res.redirect('/auth');
            }

            req.session.user = {
                id: user.id,
                login: user.login,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            };

            return res.redirect('/groups');
        } catch (err) {
            console.error('Ошибка авторизации:', err);
            req.session.error = 'Ошибка сервера';
            return res.redirect('/auth');
        }
    }

    @Post('logout')
    logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy((err) => {
            if (err) console.error(err);
            res.redirect('/auth');
        });
    }
}