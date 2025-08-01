import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {UpdateServiceDto} from "./dto/update-service.dto";
import {CreateServiceDto} from "./dto/create-service.dto";

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

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
      where: { name },
      include: {
        resources: true
      }
    });
  }

  async toggleService(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    return this.prisma.service.update({
      where: { id },
      data: { enabled: !service.enabled }
    });
  }
  async getById(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        resources: true
      }
    });
  }

  async createService(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto
    });
  }

  async updateService(id: string, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto
    });
  }

  async deleteService(id: string) {
    return this.prisma.service.delete({
      where: { id }
    });
  }
}