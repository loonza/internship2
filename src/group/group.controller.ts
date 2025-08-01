import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Param,
  Render,
  NotFoundException,
  Delete,
  Put,
  Query
} from '@nestjs/common';
import { GroupService } from './group.service';
import { Response, Request } from 'express';
import {ApiExcludeController} from "@nestjs/swagger";

@ApiExcludeController()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @Render('groups')
  async list(
      @Req() req: Request,
      @Query('page') page: string,
      @Query('perPage') perPage: string,
      @Query('search') search: string
  ) {
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 5;

    const groups = await this.groupService.getAll();


    const filteredGroups = search
        ? groups.filter(g =>
            g.name.toLowerCase().includes(search.toLowerCase()) ||
            (g.description && g.description.toLowerCase().includes(search.toLowerCase())))
        : groups;


    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedGroups = filteredGroups.slice(startIndex, startIndex + itemsPerPage);

    return {
      groups: paginatedGroups.map(group => ({
        ...group,
        source: group.source || 'Локальная'
      })),
      currentPage,
      totalPages: Math.ceil(filteredGroups.length / itemsPerPage),
      perPage: itemsPerPage,
      searchQuery: search || '',
      user: req.session.user,
      jsonGroups: JSON.stringify(filteredGroups)
    };
  }

  @Get('add')
  @Render('addGroup')
  getAddGroupForm(@Req() req: Request) {
    return { user: req.session.user };
  }

  @Post('add')
  async createGroup(@Body() body: any, @Res() res: Response) {
    await this.groupService.createGroup({
      name: body.name,
      description: body.description,
      comment: body.comment
    });
    res.redirect('/groups');
  }

  @Get(':id')
  @Render('groupView')
  async getGroup(@Param('id') id: string, @Req() req: Request) {
    const group = await this.groupService.getByIdWithMembers(id);
    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }

    return {
      group: {
        ...group,
        members: [
          ...(group.users || []).map(u => ({
            type: 'пользователь',
            name: `${u.user.lastName} ${u.user.firstName} ${u.user.middleName || ''}`.trim()
          })),
          ...(group.children || []).map(g => ({
            type: 'группа',
            name: g.childGroup.name
          }))
        ],
        source: group.source || 'Локальная'
      },
      user: req.session.user
    };
  }

  @Get(':id/members')
  async getGroupMembers(@Param('id') id: string) {
    const group = await this.groupService.getByIdWithMembers(id);
    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }


    const members = [
      ...(group.users || []).map(u =>
          `${u.user.lastName} ${u.user.firstName} ${u.user.middleName || ''}`.trim()
      ),
      ...(group.children || []).map(g => g.childGroup.name)
    ];

    return members;
  }
  @Put(':id')
  async updateGroup(
      @Param('id') id: string,
      @Body() body: { name: string; description?: string; comment?: string },
      @Res() res: Response
  ) {
    await this.groupService.updateGroup(id, body);
    res.redirect(`/groups`);
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: string, @Res() res: Response) {
    await this.groupService.deleteGroup(id);
    res.redirect('/groups');
  }
}