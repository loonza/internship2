import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.group.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getByIdWithMembers(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                lastName: true,
                firstName: true,
                middleName: true
              }
            }
          }
        },
        children: {
          include: {
            childGroup: true
          }
        }
      }
    });
  }

  async createGroup(createGroupDto: CreateGroupDto) {
    return this.prisma.group.create({
      data: createGroupDto
    });
  }

  async updateGroup(id: string, updateGroupDto: UpdateGroupDto) {
    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto
    });
  }

  async deleteGroup(id: string) {
    return this.prisma.group.delete({
      where: { id }
    });
  }
}