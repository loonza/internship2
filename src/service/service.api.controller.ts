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
    ApiProperty,
} from '@nestjs/swagger';
import {ServiceService} from './service.service';
import {CreateServiceDto} from './dto/create-service.dto';
import {UpdateServiceDto} from './dto/update-service.dto';


class CreateServiceRequestDto {
    @ApiProperty({
        description: 'Название сервиса',
        example: 'string',
        required: true
    })
    name!: string;

    @ApiProperty({
        description: 'Описание сервиса',
        example: 'string',
        required: false
    })
    description?: string;

    @ApiProperty({
        description: 'Статус сервиса (включен/выключен)',
        example: true,
        required: false,
        default: true
    })
    enabled?: boolean;
}

class UpdateServiceRequestDto {
    @ApiProperty({
        description: 'Название сервиса',
        example: 'string',
        required: false
    })
    name?: string;

    @ApiProperty({
        description: 'Описание сервиса',
        example: 'string',
        required: false
    })
    description?: string;

    @ApiProperty({
        description: 'Статус сервиса (включен/выключен)',
        example: false,
        required: false
    })
    enabled?: boolean;
}


@ApiTags('Services')
@ApiBearerAuth()
@Controller('api/services')
export class ServiceApiController {
    constructor(private readonly serviceService: ServiceService) {
    }

    @Get()
    @ApiOperation({
        summary: 'Получить список сервисов',
        description: 'Возвращает список сервисов с пагинацией и поиском'
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
        description: 'Список сервисов',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные параметры запроса'
    })
    async getAllServices(
        @Query('page') page: number = 1,
        @Query('perPage') perPage: number = 10,
        @Query('search') search?: string
    ) {
        try {
            const services = await this.serviceService.getAll();


            const filteredServices = search
                ? services.filter(s =>
                    s.name.toLowerCase().includes(search.toLowerCase()) ||
                    (s.description && s.description.toLowerCase().includes(search.toLowerCase())))
                : services;


            const startIndex = (page - 1) * perPage;
            const paginatedServices = filteredServices.slice(startIndex, startIndex + perPage);

            return {
                data: paginatedServices,
                meta: {
                    total: filteredServices.length,
                    page,
                    perPage,
                    totalPages: Math.ceil(filteredServices.length / perPage)
                }
            };
        } catch (error) {
            throw new BadRequestException('Неверные параметры запроса');
        }
    }

    @Get(':id')
    @ApiOperation({summary: 'Получить информацию о сервисе'})
    @ApiParam({
        name: 'id',
        description: 'UUID сервиса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Информация о сервисе',
    })
    @ApiResponse({
        status: 404,
        description: 'Сервис не найден'
    })
    async getService(@Param('id') id: string) {
        const service = await this.serviceService.getById(id);
        if (!service) {
            throw new NotFoundException('Сервис не найден');
        }
        return {
            status: 'success',
            data: service
        };
    }

    @Post()
    @ApiOperation({summary: 'Создать новый сервис'})
    @ApiBody({
        type: CreateServiceRequestDto,
        description: 'Данные для создания сервиса'
    })
    @ApiResponse({
        status: 201,
        description: 'Сервис успешно создан',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные данные сервиса'
    })
    async createService(@Body() createServiceDto: CreateServiceRequestDto) {
        try {
            const service = await this.serviceService.createService({
                name: createServiceDto.name,
                description: createServiceDto.description,
                enabled: createServiceDto.enabled
            } as CreateServiceDto);

            return {
                status: 'success',
                data: service
            };
        } catch (error) {
            throw new BadRequestException('Не удалось создать сервис');
        }
    }

    @Put(':id')
    @ApiOperation({summary: 'Обновить информацию о сервисе'})
    @ApiParam({
        name: 'id',
        description: 'UUID сервиса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiBody({
        type: UpdateServiceRequestDto,
        description: 'Данные для обновления сервиса'
    })
    @ApiResponse({
        status: 200,
        description: 'Информация о сервисе обновлена',
    })
    @ApiResponse({
        status: 404,
        description: 'Сервис не найден'
    })
    async updateService(
        @Param('id') id: string,
        @Body() updateServiceDto: UpdateServiceRequestDto
    ) {
        try {
            const service = await this.serviceService.updateService(id, {
                name: updateServiceDto.name,
                description: updateServiceDto.description,
                enabled: updateServiceDto.enabled
            } as UpdateServiceDto);

            return {
                status: 'success',
                data: service
            };
        } catch (error) {
            throw new NotFoundException('Сервис не найден');
        }
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({summary: 'Удалить сервис'})
    @ApiParam({
        name: 'id',
        description: 'UUID сервиса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 204,
        description: 'Сервис успешно удален'
    })
    @ApiResponse({
        status: 404,
        description: 'Сервис не найден'
    })
    async deleteService(@Param('id') id: string) {
        try {
            await this.serviceService.deleteService(id);
            return;
        } catch (error) {
            throw new NotFoundException('Сервис не найден');
        }
    }

    @Post(':id/toggle')
    @ApiOperation({summary: 'Переключить статус сервиса'})
    @ApiParam({
        name: 'id',
        description: 'UUID сервиса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Статус сервиса переключен',
        schema: {
            type: 'object',
            properties: {
                status: {type: 'string', example: 'success'},
                data: {
                    type: 'object',
                    properties: {
                        enabled: {type: 'boolean', example: true}
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Сервис не найден'
    })
    async toggleService(@Param('id') id: string) {
        try {
            const service = await this.serviceService.toggleService(id);
            return {
                status: 'success',
                data: {
                    enabled: service.enabled
                }
            };
        } catch (error) {
            throw new NotFoundException('Сервис не найден');
        }
    }
}