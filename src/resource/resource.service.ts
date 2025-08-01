import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {CreateResourceDto} from "./dto/create-resource.dto";
import {UpdateResourceDto} from "./dto/update-resource.dto";

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

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
        name: { contains: query }
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
      where: { id },
      select: {
        id: true,
        type: true,
        name: true
      }
    });
  }

  async removeAccess(id: string) {
    await this.prisma.resourceAccess.deleteMany({
      where: { accessId: id }
    });
    return { success: true };
  }

  async saveAccess(resourceId: string, accessIds: string[]) {
    await this.prisma.resourceAccess.deleteMany({
      where: { resourceId }
    });

    await this.prisma.resourceAccess.createMany({
      data: accessIds.map(accessId => ({
        resourceId,
        accessId
      }))
    });

    return { success: true };
  }

  async updateResource(id: string, updateResourceDto: UpdateResourceDto) {
    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto
    });
  }

  async deleteResource(id: string) {
    await this.prisma.resourceAccess.deleteMany({
      where: { resourceId: id }
    });
    return this.prisma.resource.delete({
      where: { id }
    });
  }

  async getResourceAccesses(resourceId: string) {
    return this.prisma.resourceAccess.findMany({
      where: { resourceId },
      include: {
        access: true
      }
    });
  }
}