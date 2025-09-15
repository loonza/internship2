import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {UpdateGroupDto} from './dto/update-group.dto';
import {CreateGroupDto} from './dto/create-group.dto';

@Injectable()
export class GroupService {
    constructor(private readonly prisma: PrismaService) {
    }

    async getAll() {
        return this.prisma.group.findMany({
            orderBy: {name: 'asc'}
        });
    }

    async getByIdWithMembers(id: string) {
        return this.prisma.group.findUnique({
            where: {id},
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                lastName: true,
                                firstName: true,
                                middleName: true
                            }
                        }
                    }
                },

                parentGroups: {
                    include: {
                        parentGroup: {
                            select: {
                                id: true,
                                name: true,
                                description: true
                            }
                        },
                        childGroup: {
                            select: {
                                id: true,
                                name: true,
                                description: true
                            }
                        },
                    }
                }
            }
        });
    }

    async createGroup(createGroupDto: CreateGroupDto) {
        return this.prisma.group.create({
            data: {
                name: createGroupDto.name,
                description: createGroupDto.description,
                comment: createGroupDto.comment,
                source: 'LOCAL'
            }
        });
    }

    async updateGroup(id: string, updateGroupDto: UpdateGroupDto) {
        return this.prisma.group.update({
            where: {id},
            data: updateGroupDto
        });
    }

    async deleteGroup(id: string) {
        await this.prisma.groupUser.deleteMany({
            where: {groupId: id}
        });

        await this.prisma.groupRelation.deleteMany({
            where: {
                OR: [
                    {parentGroupId: id},
                    {childGroupId: id}
                ]
            }
        });

        return this.prisma.group.delete({
            where: {id}
        });
    }

    async addUserToGroup(groupId: string, userId: string) {
        const existing = await this.prisma.groupUser.findFirst({
            where: {
                groupId,
                userId
            }
        });

        if (existing) {
            throw new Error('Пользователь уже в группе');
        }

        return this.prisma.groupUser.create({
            data: {
                groupId,
                userId
            }
        });
    }

    async addGroupToGroup(parentGroupId: string, childGroupId: string) {
        if (parentGroupId === childGroupId) {
            throw new Error('Нельзя добавить группу в саму себя');
        }


        const existing = await this.prisma.groupRelation.findFirst({
            where: {
                parentGroupId,
                childGroupId
            }
        });

        if (existing) {
            throw new Error('Группа уже добавлена');
        }

        const wouldCreateCycle = await this.wouldCreateCycle(parentGroupId, childGroupId);
        if (wouldCreateCycle) {
            throw new Error('Добавление создаст циклическую зависимость');
        }

        return this.prisma.groupRelation.create({
            data: {
                parentGroupId,
                childGroupId
            }
        });
    }


    private async wouldCreateCycle(parentId: string, childId: string): Promise<boolean> {
        const isChildAlreadyParent = await this.prisma.groupRelation.findFirst({
            where: {
                parentGroupId: childId,
                childGroupId: parentId
            }
        });

        return !!isChildAlreadyParent;
    }

    async removeGroupFromGroup(parentGroupId: string, childGroupId: string) {
        console.log('Removing group from group:', {parentGroupId, childGroupId});

        return this.prisma.groupRelation.deleteMany({
            where: {
                parentGroupId,
                childGroupId
            }
        });
    }

    async removeUserFromGroup(groupId: string, userId: string) {
        return this.prisma.groupUser.deleteMany({
            where: {
                groupId,
                userId
            }
        });
    }


    async getUsers() {
        return this.prisma.user.findMany({
            orderBy: [{lastName: 'asc'}, {firstName: 'asc'}],
            select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                email: true
            }
        });
    }

    async getGroupsExcluding(excludeId: string) {
        return this.prisma.group.findMany({
            where: {
                id: {not: excludeId},
                parentGroups: {
                    none: {
                        parentGroupId: excludeId
                    }
                },
            },
            orderBy: {name: 'asc'},
            select: {
                id: true,
                name: true,
                description: true
            }
        });
    }
}