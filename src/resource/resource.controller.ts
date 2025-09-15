import {Controller, Get, Post, Delete, Body, Query, Param, Res, HttpStatus, HttpException} from '@nestjs/common';
import {ResourceService} from './resource.service';
import {ApiExcludeController} from "@nestjs/swagger";
import {CreateResourceDto} from "./dto/create-resource.dto";

@ApiExcludeController()
@Controller('resources') // Изменено с 'access' на 'resources'
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {
    }

    @Get()
    async getAccessList(@Query('type') type: string) {
        return this.resourceService.getAccessList(type);
    }

    @Get('search')
    async searchAccess(@Query('q') query: string) {
        return this.resourceService.searchAccess(query);
    }

    @Get(':id')
    async getAccessDetails(@Param('id') id: string) {
        return this.resourceService.getAccessDetails(id);
    }

    @Delete('access/:id')
    async removeAccess(@Param('id') id: string) {
        return this.resourceService.removeAccess(id);
    }

    @Post('save')
    async saveAccess(@Body() body: { resourceId: string; accessIds: string[] }) {
        try {
            const result = await this.resourceService.saveAccess(body.resourceId, body.accessIds);
            return result;
        } catch (error) {
            console.error('Save access error:', error);
            throw new HttpException(
                'Ошибка при сохранении прав доступа',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    @Post('add')
    async addResource(@Body() createResourceDto: CreateResourceDto) {
        try {
            const resource = await this.resourceService.createResource(createResourceDto);
            return {success: true, resource};
        } catch (error) {
            console.error('Create resource error:', error);
            return {success: false, message: 'Ошибка создания ресурса'};
        }
    }

    @Delete(':id')
    async deleteResource(@Param('id') id: string) {
        try {
            await this.resourceService.deleteResource(id);
            return {success: true};
        } catch (error) {
            console.error('Delete resource error:', error);
            return {success: false, message: 'Ошибка удаления ресурса'};
        }
    }
}