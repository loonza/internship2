import {Controller, Delete, Get, Param, Query} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {ApiExcludeController} from '@nestjs/swagger';

@ApiExcludeController()
@Controller('api/access')
export class AccessController {
    constructor(private readonly prisma: PrismaService) {
    }

    @Get()
    async getAccessList(@Query('type') type: string, @Query('q') query: string) {
        let whereClause: any = {};

        if (type) {
            whereClause.userType = this.mapUserType(type);
        }

        if (query) {
            whereClause.OR = [
                {name: {contains: query, mode: 'insensitive'}},
                {source: {contains: query, mode: 'insensitive'}},
                {type: {contains: query, mode: 'insensitive'}}
            ];
        }

        return this.prisma.access.findMany({
            where: whereClause,
            select: {
                id: true,
                userType: true,
                source: true,
                type: true,
                name: true
            },
            orderBy: {name: 'asc'}
        });
    }

    private mapUserType(type: string): string {
        const mapping = {
            'groups': 'Группы',
            'roles': 'Роль',
            'internal': 'Внутренний'
        };
        return mapping[type] || type;
    }
    @Delete(':id')
    async deleteAccess(@Param('id') id: string) {
        try {
            console.log(id);

            await this.prisma.resourceAccess.delete({
                where: { id }
            });

            return { success: true };
        } catch (error) {
            console.error('Delete access error:', error);
            throw new Error('Ошибка при удалении доступа');
        }
    }
}