import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    HttpCode,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
export class UserApiController {
    constructor(private readonly userService: UserService) {
    }

    @Get()
    @ApiOperation({
        summary: 'Получить список пользователей',
        description: 'Возвращает список пользователей с пагинацией и поиском'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Номер страницы',
        example: 1
    })
    @ApiQuery({
        name: 'perPage',
        required: false,
        description: 'Количество элементов на странице',
        example: 10
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Строка для поиска по имени, фамилии или логину',
        example: 'Иванов'
    })
    @ApiResponse({
        status: 200,
        description: 'Список пользователей',
    })
    async getUsers(
        @Query('page') page: number = 1,
        @Query('perPage') perPage: number = 10,
        @Query('search') search?: string
    ) {
        try {
            const {users, totalCount} = await this.userService.getPaginatedUsers(
                page,
                perPage,
                search
            );

            return {
                data: users.map(user => ({
                    id: user.id,
                    fullName: `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim(),
                    login: user.login,
                    email: user.email,
                    department: user.department,
                })),
                meta: {
                    total: totalCount,
                    page,
                    perPage,
                    totalPages: Math.ceil(totalCount / perPage)
                }
            };
        } catch (error) {
            throw new BadRequestException('Неверные параметры запроса');
        }
    }

    @Post()
    @ApiOperation({summary: 'Создать нового пользователя'})
    @ApiBody({type: CreateUserDto})
    @ApiResponse({
        status: 201,
        description: 'Пользователь успешно создан',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные данные пользователя'
    })
    async createUser(@Body() createUserDto: CreateUserDto) {
        try {
            const user = await this.userService.createUser(createUserDto);
            return {
                status: 'success',
                data: user
            };
        } catch (error) {
            throw new BadRequestException('Не удалось создать пользователя');
        }
    }

    @Get(':id')
    @ApiOperation({summary: 'Получить информацию о пользователе'})
    @ApiParam({
        name: 'id',
        description: 'UUID пользователя',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Информация о пользователе',
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден'
    })
    async getUser(@Param('id') id: string) {
        const user = await this.userService.getUserById(id);
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return {
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                login: user.login,
                email: user.email,
                department: user.department,
                subdivision: user.division,
                groups: await this.userService.getUserGroups(id)
            }
        };
    }

    @Get(':id/access-rights')
    @ApiOperation({summary: 'Получить права доступа пользователя'})
    @ApiParam({
        name: 'id',
        description: 'UUID пользователя',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Список прав доступа пользователя',
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден'
    })
    async getUserAccessRights(@Param('id') id: string) {
        try {
            const accessRights = await this.userService.getUserAccessRights(id);
            return {
                data: accessRights
            };
        } catch (error) {
            throw new NotFoundException('Пользователь не найден');
        }
    }

    @Get(':id/groups')
    @ApiOperation({summary: 'Получить группы пользователя'})
    @ApiParam({
        name: 'id',
        description: 'UUID пользователя',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Список групп пользователя',
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден'
    })
    async getUserGroups(@Param('id') id: string) {
        const groups = await this.userService.getUserGroups(id);
        return {
            data: groups
        };
    }

    @Put(':id')
    @ApiOperation({summary: 'Обновить информацию о пользователе'})
    @ApiParam({
        name: 'id',
        description: 'UUID пользователя',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiBody({type: UpdateUserDto})
    @ApiResponse({
        status: 200,
        description: 'Информация о пользователе обновлена',
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден'
    })
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        try {
            const user = await this.userService.updateUser(id, updateUserDto);
            return {
                status: 'success',
                data: user
            };
        } catch (error) {
            throw new NotFoundException('Пользователь не найден');
        }
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({summary: 'Удалить пользователя'})
    @ApiParam({
        name: 'id',
        description: 'UUID пользователя',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 204,
        description: 'Пользователь успешно удален'
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден'
    })
    async deleteUser(@Param('id') id: string) {
        try {
            await this.userService.deleteUser(id);
            return;
        } catch (error) {
            throw new NotFoundException('Пользователь не найден');
        }
    }
}