import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import {UpdateUserDto} from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getPaginatedUsers(
      page: number,
      perPage: number,
      search?: string
  ) {
    const skip = (page - 1) * perPage;

    const whereCondition: Prisma.UserWhereInput = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { login: { contains: search, mode: 'insensitive' as const } },
        { department: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        skip,
        take: perPage,
        orderBy: { lastName: 'asc' }
      }),
      this.prisma.user.count({ where: whereCondition })
    ]);

    return { users, totalCount };
  }

  async createUser(data: Prisma.UserCreateInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  }
  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            group: true
          }
        }
      }
    });
  }

  async getUserGroups(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        groups: {
          include: {
            group: true
          }
        }
      }
    });

    return user?.groups.map(g => g.group.name) || [];
  }
  async updateUser(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id }
    });
  }
  async getUserAccessRights(userId: string) {

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        groups: {
          include: {
            group: true
          }
        }
      }
    });

    if (!user) {
      return [];
    }


    const resourceAccess = await this.prisma.resourceAccess.findMany({
      where: {
        OR: [

          {
            access: {
              userType: "USER",
              source: userId
            }
          },

          {
            access: {
              userType: "GROUP",
              source: {
                in: user.groups.map(g => g.group.id)
              }
            }
          }
        ]
      },
      include: {
        resource: {
          include: {
            service: true
          }
        },
        access: true
      }
    });


    return resourceAccess.map(ra => ({
      resourceName: ra.resource.name,
      serviceName: ra.resource.service.name,
      accessType: ra.access.type,
      permission: ra.access.name,
      assignedThrough: ra.access.userType === "USER" ? "Прямое назначение" : `Группа ${ra.access.source}`
    }));
  }
}