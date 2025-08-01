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
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('api/services')
export class ServiceApiController {
    constructor(private readonly serviceService: ServiceService) {}

    @Get()
    @ApiOperation({
        summary: 'Получить список сервисов',
        description: 'Возвращает список всех сервисов с их ресурсами'
    })
    @ApiResponse({
        status: 200,
        description: 'Список сервисов',
    })
    async getAllServices() {
        try {
            const services = await this.serviceService.getAll();
            return {
                status: 'success',
                data: services
            };
        } catch (error) {
            throw new BadRequestException('Не удалось получить список сервисов');
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить информацию о сервисе' })
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
        try {
            const service = await this.serviceService.getById(id);
            if (!service) {
                throw new NotFoundException('Сервис не найден');
            }
            return {
                status: 'success',
                data: service
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Ошибка при получении сервиса');
        }
    }

    @Post()
    @ApiOperation({ summary: 'Создать новый сервис' })
    @ApiBody({ type: CreateServiceDto })
    @ApiResponse({
        status: 201,
        description: 'Сервис успешно создан',
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные данные сервиса'
    })
    async createService(@Body() createServiceDto: CreateServiceDto) {
        try {
            const service = await this.serviceService.createService(createServiceDto);
            return {
                status: 'success',
                data: service
            };
        } catch (error) {
            throw new BadRequestException('Не удалось создать сервис');
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Обновить информацию о сервисе' })
    @ApiParam({
        name: 'id',
        description: 'UUID сервиса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiBody({ type: UpdateServiceDto })
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
        @Body() updateServiceDto: UpdateServiceDto
    ) {
        try {
            const service = await this.serviceService.updateService(id, updateServiceDto);
            return {
                status: 'success',
                data: service
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Ошибка при обновлении сервиса');
        }
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Удалить сервис' })
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
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Ошибка при удалении сервиса');
        }
    }

    @Post(':id/toggle')
    @ApiOperation({ summary: 'Переключить статус сервиса' })
    @ApiParam({
        name: 'id',
        description: 'UUID сервиса',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    @ApiResponse({
        status: 200,
        description: 'Статус сервиса переключен',
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
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Ошибка при переключении сервиса');
        }
    }
}