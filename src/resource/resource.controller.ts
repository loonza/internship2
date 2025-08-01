import { Controller, Get, Post, Delete, Body, Query, Param } from '@nestjs/common';
import { ResourceService } from './resource.service';
import {ApiExcludeController} from "@nestjs/swagger";

@ApiExcludeController()
@Controller('access')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  async getAccessList(@Query('type') type: string) {
    return this.resourceService.getAccessList(type);
  }

  @Get('search')
  async searchAccess(@Query('q') query: string) {
    return this.resourceService.searchAccess(query);
  }

  @Post(':id')
  async addAccess(@Param('id') id: string) {
    return this.resourceService.getAccessDetails(id);
  }

  @Delete(':id')
  async removeAccess(@Param('id') id: string) {
    return this.resourceService.removeAccess(id);
  }

  @Post('save')
  async saveAccess(@Body() body: { resourceId: string; accessIds: string[] }) {
    return this.resourceService.saveAccess(body.resourceId, body.accessIds);
  }
}