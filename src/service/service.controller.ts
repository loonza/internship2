import {Controller, Get, Param, Post, Req, Res, Render, Body, Delete} from '@nestjs/common';
import {ServiceService} from './service.service';
import {Response, Request} from 'express';
import {CreateServiceDto} from './dto/create-service.dto';
import {UpdateServiceDto} from './dto/update-service.dto';
import {ApiExcludeController} from "@nestjs/swagger";
import {ResourceService} from "src/resource/resource.service";

@ApiExcludeController()
@Controller('services')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService, private readonly resourceService: ResourceService) {
    }

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
            return {redirect: '/services'};
        }

        const accessList = await this.serviceService.getServiceAccess(service.id);

        return {
            service: {
                ...service,
                description: service.description || 'Нет описания'
            },
            selectedAccess: accessList,
            user: req.session.user
        };
    }

    @Get('add')
    @Render('serviceAdd')
    async addForm(@Req() req: Request) {
        return {
            user: req.session.user
        };
    }

    @Post('add')
    async createService(
        @Body() body: any,
        @Res() res: Response
    ) {
        try {
            const createServiceDto: CreateServiceDto = {
                name: body.name,
                description: body.description,
                enabled: body.enabled === 'on'
            };

            await this.serviceService.createService(createServiceDto);
            return res.redirect('/services');
        } catch (error) {
            console.error('Create service error:', error);
            return res.redirect('/services/add?error=Ошибка создания сервиса');
        }
    }

    @Post(':id/update')
    async updateService(
        @Param('id') id: string,
        @Body() body: any,
        @Res() res: Response
    ) {
        try {
            const updateServiceDto: UpdateServiceDto = {
                name: body.name,
                description: body.description,
                enabled: body.enabled
            };

            await this.serviceService.updateService(id, updateServiceDto);
            return res.redirect(`/services/view?name=${encodeURIComponent(body.name)}`);
        } catch (error) {
            console.error('Update service error:', error);
            return res.redirect(`/services/view?name=${encodeURIComponent(body.name)}&error=Ошибка обновления сервиса`);
        }
    }

    @Delete(':id')
    async deleteService(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        try {
            await this.serviceService.deleteService(id);
            return res.json({success: true});
        } catch (error) {
            console.error('Delete service error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка удаления сервиса'
            });
        }
    }

    @Delete('resource/:id')
    async deleteResource(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        try {
            await this.resourceService.deleteResource(id);
            return res.json({success: true});
        } catch (error) {
            console.error('Delete resource error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка удаления ресурса'
            });
        }
    }


    @Post('resource/add')
    async createResource(
        @Body() body: any,
        @Res() res: Response
    ) {
        try {
            const createResourceDto = {
                name: body.name,
                description: body.description,
                serviceId: body.serviceId
            };

            await this.resourceService.createResource(createResourceDto);
            return res.json({success: true});
        } catch (error) {
            console.error('Create resource error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка создания ресурса'
            });
        }
    }
}