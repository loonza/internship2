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
import {GroupService} from './group.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('api/groups')
export class GroupApiController {
    constructor(private readonly groupService: GroupService) {
    }

    @Get()
    @ApiOperation({
        summary: 'Получить список групп',
        description: 'Возвращает список групп с пагинацией и поиском'
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
        description: 'Строка для поиска по имени или описанию',
        example: 'admin'
    })
    @ApiResponse({
        status: 200,
        description: 'Список групп',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные параметры запроса'
    })
    async getAllGroups(
        @Query('page') page: number = 1,
        @Query('perPage') perPage: number = 10,
        @Query('search') search?: string
    ) {
        try {
            const groups = await this.groupService.getAll();

            const filteredGroups = search
                ? groups.filter(g =>
                    g.name.toLowerCase().includes(search.toLowerCase()) ||
                    (g.description && g.description.toLowerCase().includes(search.toLowerCase())))
                : groups;

            const startIndex = (page - 1) * perPage;
            const paginatedGroups = filteredGroups.slice(startIndex, startIndex + perPage);

            return {
                data: paginatedGroups,
                meta: {
                    total: filteredGroups.length,
                    page,
                    perPage,
                    totalPages: Math.ceil(filteredGroups.length / perPage)
                }
            };
        } catch (error) {
            throw new BadRequestException('Неверные параметры запроса');
        }
    }

    @Post()
    @ApiOperation({summary: 'Создать новую группу'})
    @ApiBody({type: CreateGroupDto})
    @ApiResponse({
        status: 201,
        description: 'Группа успешно создана',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные данные группы'
    })
    async createGroup(@Body() createGroupDto: CreateGroupDto) {
        try {
            const group = await this.groupService.createGroup(createGroupDto);
            return {
                status: 'success',
                data: group
            };
        } catch (error) {
            throw new BadRequestException('Не удалось создать группу');
        }
    }

    @Get(':id')
    @ApiOperation({summary: 'Получить информацию о группе'})
    @ApiParam({
        name: 'id',
        description: 'UUID группы',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Информация о группе',
    })
    @ApiResponse({
        status: 404,
        description: 'Группа не найдена'
    })
    async getGroup(@Param('id') id: string) {
        const group = await this.groupService.getByIdWithMembers(id);
        if (!group) {
            throw new NotFoundException('Группа не найдена');
        }
        return group;
    }

    @Get(':id/members')
    @ApiOperation({summary: 'Получить список участников группы'})
    @ApiParam({
        name: 'id',
        description: 'UUID группы',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Список участников группы',
    })
    @ApiResponse({
        status: 404,
        description: 'Группа не найдена'
    })
    async getGroupMembers(@Param('id') id: string) {
        const group = await this.groupService.getByIdWithMembers(id);
        if (!group) {
            throw new NotFoundException('Группа не найдена');
        }

        const members = [
            ...(group.users || []).map(u =>
                `${u.user.lastName} ${u.user.firstName} ${u.user.middleName || ''}`.trim()
            ),
            ...(group.parentGroups || []).map(g => g.childGroup.name)
        ];

        return {members};
    }

    @Put(':id')
    @ApiOperation({summary: 'Обновить информацию о группе'})
    @ApiParam({
        name: 'id',
        description: 'UUID группы',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiBody({type: UpdateGroupDto})
    @ApiResponse({
        status: 200,
        description: 'Информация о группе обновлена',
    })
    @ApiResponse({
        status: 404,
        description: 'Группа не найдена'
    })
    async updateGroup(
        @Param('id') id: string,
        @Body() updateGroupDto: UpdateGroupDto
    ) {
        try {
            const group = await this.groupService.updateGroup(id, updateGroupDto);
            return {
                status: 'success',
                data: group
            };
        } catch (error) {
            throw new NotFoundException('Группа не найдена');
        }
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({summary: 'Удалить группу'})
    @ApiParam({
        name: 'id',
        description: 'UUID группы',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 204,
        description: 'Группа успешно удалена'
    })
    @ApiResponse({
        status: 404,
        description: 'Группа не найдена'
    })
    async deleteGroup(@Param('id') id: string) {
        try {
            await this.groupService.deleteGroup(id);
            return;
        } catch (error) {
            throw new NotFoundException('Группа не найдена');
        }
    }
}