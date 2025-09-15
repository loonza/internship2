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
    Query,
    HttpCode
} from '@nestjs/common';
import {GroupService} from './group.service';
import {Response, Request} from 'express';
import {ApiExcludeController} from "@nestjs/swagger";

@ApiExcludeController()
@Controller('groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {
    }

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
        return {user: req.session.user};
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

        const members = [
            ...(group.users || []).map(u => ({
                id: u.user.id,
                type: 'user',
                name: `${u.user.lastName} ${u.user.firstName} ${u.user.middleName || ''}`.trim()
            })),
            ...(group.parentGroups || []).map(relation => ({
                id: relation.childGroup.id,
                type: 'group',
                name: relation.childGroup.name
            }))
        ];


        console.log('Final members count:', members.length);

        return {
            group: {
                id: group.id,
                name: group.name,
                description: group.description,
                source: group.source || 'Локальная',
                comment: group.comment,
                members: members
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
            ...(group.parentGroups || []).map(relation => relation.childGroup.name)
        ];

        return members;
    }

    @Post(':id/members')
    async addMember(
        @Param('id') id: string,
        @Body() body: { memberType: string; userId?: string; groupId?: string },
        @Res() res: Response
    ) {
        try {
            if (body.memberType === 'user' && body.userId) {
                await this.groupService.addUserToGroup(id, body.userId);
            } else if (body.memberType === 'group' && body.groupId) {
                await this.groupService.addGroupToGroup(id, body.groupId);
            } else {
                throw new Error('Неверные параметры запроса');
            }

            res.redirect(`/groups/${id}`);
        } catch (error) {
            console.error('Error adding member:', error);
            res.status(400).redirect(`/groups/${id}?error=Не удалось добавить участника`);
        }
    }

    @Delete(':id/members')
    async removeMember(
        @Param('id') id: string,
        @Body() body: { memberType: string; memberId: string },
        @Res() res: Response
    ) {
        console.log(body);
        try {
            if (body.memberType === 'user') {
                await this.groupService.removeUserFromGroup(id, body.memberId);
            } else if (body.memberType === 'group') {
                await this.groupService.removeGroupFromGroup(id, body.memberId);
            }

            res.status(200).send('Участник удален');
        } catch (error) {
            console.error('Error removing member:', error);
            res.status(400).send('Не удалось удалить участника');
        }
    }

    @Delete(':groupId/users/:userId')
    async removeUserFromGroup(
        @Param('groupId') groupId: string,
        @Param('userId') userId: string,
        @Res() res: Response
    ) {
        try {
            await this.groupService.removeUserFromGroup(groupId, userId);
            res.status(200).json({message: 'Пользователь удален из группы'});
        } catch (error) {
            console.error('Error removing user from group:', error);
            res.status(400).json({error: 'Не удалось удалить пользователя из группы'});
        }
    }

    @Put(':id')
    async updateGroup(
        @Param('id') id: string,
        @Body() body: { name: string; description?: string; comment?: string },
        @Res() res: Response
    ) {
        await this.groupService.updateGroup(id, body);
        res.redirect(`/groups/${id}`);
    }

    @Delete(':id')
    async deleteGroup(@Param('id') id: string, @Res() res: Response) {
        await this.groupService.deleteGroup(id);
        res.redirect('/groups');
    }

    @Get('api/users')
    @HttpCode(200)
    async getUsers(@Query('search') search?: string) {
        const users = await this.groupService.getUsers();

        if (search) {
            const searchLower = search.toLowerCase();
            return users.filter(u =>
                u.lastName.toLowerCase().includes(searchLower) ||
                u.firstName.toLowerCase().includes(searchLower) ||
                (u.middleName && u.middleName.toLowerCase().includes(searchLower)) ||
                u.email.toLowerCase().includes(searchLower)
            );
        }

        return users;
    }

    @Get('api/groups/exclude/:id')
    @HttpCode(200)
    async getGroupsExcluding(@Param('id') id: string, @Query('search') search?: string) {
        const groups = await this.groupService.getGroupsExcluding(id);

        if (search) {
            const searchLower = search.toLowerCase();
            return groups.filter(g =>
                g.name.toLowerCase().includes(searchLower) ||
                (g.description && g.description.toLowerCase().includes(searchLower))
            );
        }

        return groups;
    }
}