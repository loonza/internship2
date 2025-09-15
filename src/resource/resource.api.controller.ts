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
import {ResourceService} from './resource.service';
import {CreateResourceDto} from './dto/create-resource.dto';
import {UpdateResourceDto} from './dto/update-resource.dto';

@ApiTags('Resources')
@ApiBearerAuth()
@Controller('api/resources')
export class ResourceApiController {
    constructor(private readonly resourceService: ResourceService) {
    }

    @Get()
    @ApiOperation({
        summary: 'Получить список ресурсов',
        description: 'Возвращает список ресурсов с пагинацией и поиском'
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
    @ApiQuery({
        name: 'serviceId',
        required: false,
        description: 'Фильтр по ID сервиса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Список ресурсов',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные параметры запроса'
    })
    async getAllResources(
        @Query('page') page: number = 1,
        @Query('perPage') perPage: number = 10,
        @Query('search') search?: string,
        @Query('serviceId') serviceId?: string
    ) {
        try {

            const resources = await this.resourceService.getAllResources();

            let filteredResources = resources;

            if (search) {
                filteredResources = filteredResources.filter(r =>
                    r.name.toLowerCase().includes(search.toLowerCase()) ||
                    (r.description && r.description.toLowerCase().includes(search.toLowerCase())));
            }

            if (serviceId) {
                filteredResources = filteredResources.filter(r => r.serviceId === serviceId);
            }

            const startIndex = (page - 1) * perPage;
            const paginatedResources = filteredResources.slice(startIndex, startIndex + perPage);

            return {
                data: paginatedResources,
                meta: {
                    total: filteredResources.length,
                    page,
                    perPage,
                    totalPages: Math.ceil(filteredResources.length / perPage)
                }
            };
        } catch (error) {
            throw new BadRequestException('Неверные параметры запроса');
        }
    }

    @Get(':id')
    @ApiOperation({summary: 'Получить информацию о ресурсе'})
    @ApiParam({
        name: 'id',
        description: 'UUID ресурса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Информация о ресурсе',
    })
    @ApiResponse({
        status: 404,
        description: 'Ресурс не найден'
    })
    async getResource(@Param('id') id: string) {
        const resource = await this.resourceService.getById(id);
        if (!resource) {
            throw new NotFoundException('Ресурс не найден');
        }
        return {
            status: 'success',
            data: resource
        };
    }

    @Post()
    @ApiOperation({summary: 'Создать новый ресурс'})
    @ApiBody({type: CreateResourceDto})
    @ApiResponse({
        status: 201,
        description: 'Ресурс успешно создан',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные данные ресурса'
    })
    async createResource(@Body() createResourceDto: CreateResourceDto) {
        try {
            const resource = await this.resourceService.createResource(createResourceDto);
            return {
                status: 'success',
                data: resource
            };
        } catch (error) {
            throw new BadRequestException('Не удалось создать ресурс');
        }
    }

    @Put(':id')
    @ApiOperation({summary: 'Обновить информацию о ресурсе'})
    @ApiParam({
        name: 'id',
        description: 'UUID ресурса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiBody({type: UpdateResourceDto})
    @ApiResponse({
        status: 200,
        description: 'Информация о ресурсе обновлена',
    })
    @ApiResponse({
        status: 404,
        description: 'Ресурс не найден'
    })
    async updateResource(
        @Param('id') id: string,
        @Body() updateResourceDto: UpdateResourceDto
    ) {
        try {
            const resource = await this.resourceService.updateResource(id, updateResourceDto);
            return {
                status: 'success',
                data: resource
            };
        } catch (error) {
            throw new NotFoundException('Ресурс не найден');
        }
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({summary: 'Удалить ресурс'})
    @ApiParam({
        name: 'id',
        description: 'UUID ресурса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 204,
        description: 'Ресурс успешно удален'
    })
    @ApiResponse({
        status: 404,
        description: 'Ресурс не найден'
    })
    async deleteResource(@Param('id') id: string) {
        try {
            await this.resourceService.deleteResource(id);
            return;
        } catch (error) {
            throw new NotFoundException('Ресурс не найден');
        }
    }

    @Get(':id/access')
    @ApiOperation({
        summary: 'Получить права доступа ресурса',
        description: 'Возвращает список прав доступа для конкретного ресурса'
    })
    @ApiParam({
        name: 'id',
        description: 'UUID ресурса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Права доступа ресурса',
    })
    @ApiResponse({
        status: 404,
        description: 'Ресурс не найден'
    })
    async getResourceAccess(@Param('id') id: string) {
        try {
            const accessList = await this.resourceService.getResourceAccesses(id);
            return {
                status: 'success',
                data: accessList.map(ra => ra.access)
            };
        } catch (error) {
            throw new BadRequestException('Ошибка при получении прав доступа');
        }
    }

    @Post('save-access')
    @ApiOperation({
        summary: 'Сохранить доступы для ресурса',
        description: 'Связывает выбранные доступы с ресурсом'
    })
    @ApiBody({
        description: 'Данные для сохранения',
        schema: {
            type: 'object',
            properties: {
                resourceId: {
                    type: 'string',
                    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
                },
                accessIds: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6', '4fa85f64-5717-4562-b3fc-2c963f66afa7']
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Доступы успешно сохранены',
    })
    @ApiResponse({
        status: 400,
        description: 'Ошибка при сохранении доступов'
    })
    async saveAccess(@Body() body: { resourceId: string; accessIds: string[] }) {
        try {
            const result = await this.resourceService.saveAccess(body.resourceId, body.accessIds);
            return {
                status: 'success',
                data: result
            };
        } catch (error) {
            throw new BadRequestException('Ошибка при сохранении доступов');
        }
    }
}