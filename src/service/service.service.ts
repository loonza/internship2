import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {UpdateServiceDto} from "./dto/update-service.dto";
import {CreateServiceDto} from "./dto/create-service.dto";

@Injectable()
export class ServiceService {
    constructor(private readonly prisma: PrismaService) {
    }

    async getAll() {
        return this.prisma.service.findMany({
            include: {
                resources: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async getByName(name: string) {
        return this.prisma.service.findUnique({
            where: {name},
            include: {
                resources: true
            }
        });
    }

    async toggleService(id: string) {
        const service = await this.prisma.service.findUnique({
            where: {id}
        });

        if (!service) {
            throw new Error('Service not found');
        }

        return this.prisma.service.update({
            where: {id},
            data: {enabled: !service.enabled}
        });
    }

    async getById(id: string) {
        return this.prisma.service.findUnique({
            where: {id},
            include: {
                resources: true
            }
        });
    }

    async createService(createServiceDto: CreateServiceDto) {
        return this.prisma.service.create({
            data: {
                name: createServiceDto.name,
                description: createServiceDto.description,
                enabled: createServiceDto.enabled !== undefined ? createServiceDto.enabled : true
            }
        });
    }

    async updateService(id: string, updateServiceDto: UpdateServiceDto) {
        const existingService = await this.prisma.service.findUnique({
            where: {id}
        });

        if (!existingService) {
            throw new Error('Service not found');
        }

        return this.prisma.service.update({
            where: {id},
            data: updateServiceDto
        });
    }

    async deleteService(id: string) {
        const resources = await this.prisma.resource.findMany({
            where: {serviceId: id},
            select: {id: true}
        });

        const resourceIds = resources.map(r => r.id);

        if (resourceIds.length > 0) {
            await this.prisma.resourceAccess.deleteMany({
                where: {resourceId: {in: resourceIds}}
            });
        }


        await this.prisma.resource.deleteMany({
            where: {serviceId: id}
        });


        return this.prisma.service.delete({
            where: {id}
        });

    }


    async getServiceAccess(serviceId: string) {
        const resources = await this.prisma.resource.findMany({
            where: {serviceId},
            include: {
                ResourceAccess: {
                    include: {
                        access: true
                    }
                }
            }
        });

        const accessMap = new Map();

        resources.forEach(resource => {
            resource.ResourceAccess.forEach(ra => {
                if (ra.access) {
                    accessMap.set(ra.access.id, {
                        id: ra.access.id,
                        userType: ra.access.userType,
                        source: ra.access.source,
                        type: ra.access.type,
                        name: ra.access.name
                    });
                }
            });
        });

        return Array.from(accessMap.values());
    }
}