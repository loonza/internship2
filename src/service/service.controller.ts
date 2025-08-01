import { Controller, Get, Param, Post, Req, Res, Render } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Response, Request } from 'express';
import {ApiExcludeController} from "@nestjs/swagger";

@ApiExcludeController()
@Controller('services')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}

    @Get()
    @Render('services')
    async list(@Req() req: Request) {
        const services = await this.serviceService.getAll();
        return {
            services,
            totalPages: Math.ceil(services.length / 50),
            user: req.session.user
        };
    }

    @Post(':id/toggle')
    async toggleService(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        try {
            const service = await this.serviceService.toggleService(id);
            return res.json({
                success: true,
                enabled: service.enabled
            });
        } catch (error) {
            console.error('Toggle error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка переключения сервиса'
            });
        }
    }

    @Get('view')
    @Render('serviceView')
    async view(@Req() req: Request) {
        const name = req.query.name as string;
        const service = await this.serviceService.getByName(name);
        if (!service) {
            return { redirect: '/services' };
        }

        return {
            service: {
                ...service,
                description: service.description || 'Нет описания'
            },
            user: req.session.user
        };
    }
}