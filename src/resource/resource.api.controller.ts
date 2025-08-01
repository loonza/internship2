import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Query,
    Param,
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
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@ApiTags('Resources')
@ApiBearerAuth()
@Controller('api/resources')
export class ResourceApiController {
    constructor(private readonly resourceService: ResourceService) {}

    @Get('')
    @ApiOperation({
        summary: 'Получить список доступов',
        description: 'Возвращает список доступов по типу'
    })
    @ApiQuery({
        name: 'type',
        required: true,
        description: 'Тип доступа (groups, roles, internal)',
        example: 'groups'
    })
    @ApiResponse({
        status: 200,
        description: 'Список доступов',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверный тип доступа'
    })
    async getAccessList(@Query('type') type: string) {
        try {
            const accessList = await this.resourceService.getAccessList(type);
            return {
                status: 'success',
                data: accessList
            };
        } catch (error) {
            throw new BadRequestException('Неверный тип доступа');
        }
    }

    @Get('')
    @ApiOperation({
        summary: 'Поиск доступов',
        description: 'Поиск доступов по названию'
    })
    @ApiQuery({
        name: 'q',
        required: true,
        description: 'Строка поиска',
        example: 'admin'
    })
    @ApiResponse({
        status: 200,
        description: 'Результаты поиска',
    })
    async searchAccess(@Query('q') query: string) {
        try {
            const results = await this.resourceService.searchAccess(query);
            return {
                status: 'success',
                data: results
            };
        } catch (error) {
            throw new BadRequestException('Ошибка поиска');
        }
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Получить детали доступа',
        description: 'Возвращает детальную информацию о доступе'
    })
    @ApiParam({
        name: 'id',
        description: 'ID доступа',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Детали доступа',
    })
    @ApiResponse({
        status: 404,
        description: 'Доступ не найден'
    })
    async getAccessDetails(@Param('id') id: string) {
        try {
            const access = await this.resourceService.getAccessDetails(id);
            if (!access) {
                throw new NotFoundException('Доступ не найден');
            }
            return {
                status: 'success',
                data: access
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Ошибка при получении доступа');
        }
    }

    @Post('')
    @HttpCode(200)
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

    @Delete('access/:id')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Удалить доступ',
        description: 'Удаляет доступ и все его связи с ресурсами'
    })
    @ApiParam({
        name: 'id',
        description: 'ID доступа',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Доступ успешно удален',
    })
    @ApiResponse({
        status: 404,
        description: 'Доступ не найден'
    })
    async removeAccess(@Param('id') id: string) {
        try {
            const result = await this.resourceService.removeAccess(id);
            return {
                status: 'success',
                data: result
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Ошибка при удалении доступа');
        }
    }
}