import {Controller, Get, Post, Body, Render, Req, Res, Query, Param, NotFoundException} from '@nestjs/common';
import {Request, Response} from 'express';
import {UserService} from './user.service';
import {ApiExcludeController} from "@nestjs/swagger";

@ApiExcludeController()
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {
    }


    @Get()
    @Render('users')
    async list(
        @Req() req: Request,
        @Query('page') page: string,
        @Query('perPage') perPage: string,
        @Query('search') search: string
    ) {
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(perPage) || 10;

        const {users, totalCount} = await this.userService.getPaginatedUsers(
            currentPage,
            itemsPerPage,
            search
        );


        const formattedUsers = users.map(user => ({
            id: user.id,
            fullname: `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim(),
            login: user.login || '',
            comment: user.comment || ''
        }));

        return {
            users: formattedUsers,
            currentPage,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            perPage: itemsPerPage,
            searchQuery: search || '',
            user: req.session.user
        };
    }
    @Get(':id/access-rights')
    async getUserAccessRights(@Param('id') id: string) {
        return this.userService.getUserAccessRights(id);
    }

    @Get('add')
    @Render('users/add')
    getAddPage(@Req() req: Request) {
        return {user: req.session.user};
    }

    @Post('add')
    async addUser(@Body() body: any, @Res() res: Response) {
        await this.userService.createUser(body);
        res.redirect('/users');
    }

    @Get(':id/groups')
    async getUserGroups(@Param('id') id: string) {
        return this.userService.getUserGroups(id);
    }
    @Get(':id')
    @Render('user')
    async getUserProfile(@Param('id') id: string) {
        const user = await this.userService.getUserById(id);

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }


        return {
            user: {
                id: user.id,
                name: `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim(),
                login: user.login,
                email: user.email,
                prefix: user.prefix,
                lastname: user.lastName,
                firstname: user.firstName,
                middlename: user.middleName,
                suffix: user.suffix,
                department: user.department,
                subdivision: user.division,
                groups: await this.userService.getUserGroups(id)
            }
        };
    }
}