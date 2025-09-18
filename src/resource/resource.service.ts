import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {CreateResourceDto} from "./dto/create-resource.dto";
import {UpdateResourceDto} from "./dto/update-resource.dto";

@Injectable()
export class ResourceService {
    constructor(private prisma: PrismaService) {
    }

    async getAccessList(type: string) {
        return this.prisma.access.findMany({
            where: {
                userType: type === 'groups' ? 'Группы' :
                    type === 'roles' ? 'Роль' : 'Внутренний'
            },
            select: {
                id: true,
                userType: true,
                source: true,
                type: true,
                name: true
            }
        });
    }

    async searchAccess(query: string) {
        return this.prisma.access.findMany({
            where: {
                name: {contains: query}
            },
            select: {
                id: true,
                userType: true,
                source: true,
                type: true,
                name: true
            },
            take: 10
        });
    }

    async getAccessDetails(id: string) {
        return this.prisma.access.findUnique({
            where: {id},
            select: {
                id: true,
                type: true,
                name: true
            }
        });
    }

    async removeAccess(id: string) {
        try {
            const access = await this.prisma.access.findUnique({
                where: { id }
            });

            if (!access) {
                throw new Error('Доступ не найден');
            }

            await this.prisma.resourceAccess.deleteMany({
                where: { accessId: id }
            });

            return { success: true };
        } catch (error) {
            console.error('Error removing access:', error);
            throw new Error('Ошибка при удалении доступа');
        }
    }

    async saveAccess(resourceId: string, accessIds: string[]) {
        try {
            const resource = await this.prisma.resource.findUnique({
                where: {id: resourceId}
            });

            if (!resource) {
                throw new Error('Ресурс не найден');
            }

            await this.prisma.resourceAccess.deleteMany({
                where: {resourceId}
            });

            if (accessIds && accessIds.length > 0) {
                const accessData = accessIds.map(accessId => ({
                    resourceId,
                    accessId
                }));

                await this.prisma.resourceAccess.createMany({
                    data: accessData,
                    skipDuplicates: true
                });
            }

            return {success: true};
        } catch (error) {
            console.error('Error saving access:', error);
            throw new Error('Ошибка при сохранении прав доступа');
        }
    }

    async updateResource(id: string, updateResourceDto: UpdateResourceDto) {
        return this.prisma.resource.update({
            where: {id},
            data: updateResourceDto
        });
    }


    async getResourceAccesses(resourceId: string) {
        return this.prisma.resourceAccess.findMany({
            where: {resourceId},
            include: {
                access: true
            }
        });
    }

    async deleteResource(id: string) {
        const resource = await this.prisma.resource.findUnique({
            where: { id },
            include: { ResourceAccess: true }
        });

        if (!resource) {
            throw new Error('Ресурс не найден');
        }

        await this.prisma.resourceAccess.deleteMany({
            where: { resourceId: id }
        });

        return this.prisma.resource.delete({
            where: { id }
        });
    }

    async createResource(createResourceDto: CreateResourceDto) {
        return this.prisma.resource.create({
            data: {
                name: createResourceDto.name,
                description: createResourceDto.description,
                serviceId: createResourceDto.serviceId
            }
        });
    }

    async getAllResources() {
        return this.prisma.resource.findMany({
            include: {
                service: true,
                ResourceAccess: {
                    include: {
                        access: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async getById(id: string) {
        return this.prisma.resource.findUnique({
            where: {id},
            include: {
                service: true,
                ResourceAccess: {
                    include: {
                        access: true
                    }
                }
            }
        });
    }
    async removeResourceAccess(resourceId: string, accessId: string) {
        try {
            await this.prisma.resourceAccess.delete({
                where: {
                    resourceId_accessId: {
                        resourceId,
                        accessId
                    }
                }
            });
            return { success: true };
        } catch (error) {
            console.error('Error removing resource access:', error);
            throw new Error('Ошибка при удалении связи доступ-ресурс');
        }
    }
}