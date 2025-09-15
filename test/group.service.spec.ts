import {expect} from 'chai';
import sinon from 'sinon';
import {ServiceService} from '../src/service/service.service';
import {ResourceService} from '../src/resource/resource.service';
import {UserService} from '../src/user/user.service';
import {AuthService} from '../src/auth/auth.service';
import {GroupService} from '../src/group/group.service';
import {PrismaService} from '../src/prisma.service';
import {faker} from '@faker-js/faker/locale/ru';
import {Service, Resource, User, Group, AuthSource, Access, ResourceAccess} from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Service Tests', () => {
    let serviceService: ServiceService;
    let resourceService: ResourceService;
    let userService: UserService;
    let authService: AuthService;
    let groupService: GroupService;
    let prisma: PrismaService;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        prisma = {
            service: {
                findMany: sandbox.stub(),
                findUnique: sandbox.stub(),
                create: sandbox.stub(),
                update: sandbox.stub(),
                delete: sandbox.stub(),
                deleteMany: sandbox.stub()
            },
            resource: {
                findMany: sandbox.stub(),
                findUnique: sandbox.stub(),
                create: sandbox.stub(),
                update: sandbox.stub(),
                delete: sandbox.stub(),
                deleteMany: sandbox.stub()
            },
            user: {
                findMany: sandbox.stub(),
                findUnique: sandbox.stub(),
                create: sandbox.stub(),
                update: sandbox.stub(),
                delete: sandbox.stub(),
                count: sandbox.stub()
            },
            group: {
                findMany: sandbox.stub(),
                findUnique: sandbox.stub(),
                create: sandbox.stub(),
                update: sandbox.stub(),
                delete: sandbox.stub(),
                deleteMany: sandbox.stub()
            },
            access: {
                findMany: sandbox.stub(),
                findUnique: sandbox.stub()
            },
            resourceAccess: {
                findMany: sandbox.stub(),
                deleteMany: sandbox.stub(),
                createMany: sandbox.stub()
            },
            groupUser: {
                findFirst: sandbox.stub(),
                create: sandbox.stub(),
                deleteMany: sandbox.stub(),
                findMany: sandbox.stub()
            },
            groupRelation: {
                findFirst: sandbox.stub(),
                create: sandbox.stub(),
                deleteMany: sandbox.stub(),
                findMany: sandbox.stub()
            }
        } as unknown as PrismaService;

        serviceService = new ServiceService(prisma);
        resourceService = new ResourceService(prisma);
        userService = new UserService(prisma);
        authService = new AuthService(prisma);
        groupService = new GroupService(prisma);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('ServiceService', () => {
        describe('getAll()', () => {
            it('Возвращает сервисы с сортировкой по названию', async () => {
                const mockServices: Service[] = [
                    {
                        id: faker.string.uuid(),
                        name: 'B Service',
                        description: 'Description B',
                        enabled: true,

                    },
                    {
                        id: faker.string.uuid(),
                        name: 'A Service',
                        description: 'Description A',
                        enabled: true,

                    }
                ];

                const findManyStub = prisma.service.findMany as sinon.SinonStub;
                findManyStub.resolves(mockServices);

                const result = await serviceService.getAll();

                expect(result).to.deep.equal(mockServices);
                expect(findManyStub.calledOnce).to.be.true;
                expect(findManyStub.calledWith({
                    include: {resources: true},
                    orderBy: {name: 'asc'}
                })).to.be.true;
            });
        });

        describe('getByName()', () => {
            it('Возвращает сервис по имени', async () => {
                const serviceName = 'test-service';
                const mockService: Service = {
                    id: faker.string.uuid(),
                    name: serviceName,
                    description: 'Test Service',
                    enabled: true,

                };

                const findUniqueStub = prisma.service.findUnique as sinon.SinonStub;
                findUniqueStub.resolves(mockService);

                const result = await serviceService.getByName(serviceName);

                expect(result).to.deep.equal(mockService);
                expect(findUniqueStub.calledWith({
                    where: {name: serviceName},
                    include: {resources: true}
                })).to.be.true;
            });
        });

        describe('getById()', () => {
            it('Возвращает сервис по ID', async () => {
                const serviceId = faker.string.uuid();
                const mockService: Service = {
                    id: serviceId,
                    name: 'Test Service',
                    description: 'Test Description',
                    enabled: true,

                };

                const findUniqueStub = prisma.service.findUnique as sinon.SinonStub;
                findUniqueStub.resolves(mockService);

                const result = await serviceService.getById(serviceId);

                expect(result).to.deep.equal(mockService);
                expect(findUniqueStub.calledWith({
                    where: {id: serviceId},
                    include: {resources: true}
                })).to.be.true;
            });
        });

        describe('createService()', () => {
            it('Создание сервиса', async () => {
                const serviceData = {
                    name: 'New Service',
                    description: 'Test Description',
                    enabled: true
                };

                const createdService: Service = {
                    id: faker.string.uuid(),
                    ...serviceData,

                };

                const createStub = prisma.service.create as sinon.SinonStub;
                createStub.resolves(createdService);

                const result = await serviceService.createService(serviceData);

                expect(result).to.deep.equal(createdService);
                expect(createStub.calledOnce).to.be.true;
            });
        });

        describe('updateService()', () => {
            it('Обновление сервиса', async () => {
                const serviceId = faker.string.uuid();
                const updateData = {
                    name: 'Updated Service',
                    description: 'Updated Description',
                    enabled: false
                };

                const existingService: Service = {
                    id: serviceId,
                    name: 'Old Service',
                    description: 'Old Description',
                    enabled: true,

                };

                const updatedService: Service = {
                    ...existingService,
                    ...updateData,

                };

                const findUniqueStub = prisma.service.findUnique as sinon.SinonStub;
                findUniqueStub.resolves(existingService);

                const updateStub = prisma.service.update as sinon.SinonStub;
                updateStub.resolves(updatedService);

                const result = await serviceService.updateService(serviceId, updateData);

                expect(result).to.deep.equal(updatedService);
                expect(findUniqueStub.calledWith({where: {id: serviceId}})).to.be.true;
                expect(updateStub.calledWith({
                    where: {id: serviceId},
                    data: updateData
                })).to.be.true;
            });
        });

        describe('toggleService()', () => {
            it('Переключение статуса сервиса', async () => {
                const serviceId = faker.string.uuid();
                const mockService = {
                    id: serviceId,
                    name: 'Test Service',
                    enabled: true,
                    description: 'Test',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const findUniqueStub = prisma.service.findUnique as sinon.SinonStub;
                findUniqueStub.resolves(mockService);

                const updateStub = prisma.service.update as sinon.SinonStub;
                updateStub.resolves({...mockService, enabled: false});

                const result = await serviceService.toggleService(serviceId);

                expect(result.enabled).to.be.false;
                expect(findUniqueStub.calledWith({where: {id: serviceId}})).to.be.true;
                expect(updateStub.calledWith({
                    where: {id: serviceId},
                    data: {enabled: false}
                })).to.be.true;
            });
        });

        describe('deleteService()', () => {
            it('Удаление сервиса', async () => {
                const serviceId = faker.string.uuid();

                const deleteManyStub = prisma.resource.deleteMany as sinon.SinonStub;
                deleteManyStub.resolves({count: 2});

                const deleteStub = prisma.service.delete as sinon.SinonStub;
                deleteStub.resolves({
                    id: serviceId,
                    name: 'Test Service',
                    description: 'Test',
                    enabled: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                const result = await serviceService.deleteService(serviceId);

                expect(deleteManyStub.calledWith({where: {serviceId}})).to.be.true;
                expect(deleteStub.calledWith({where: {id: serviceId}})).to.be.true;
            });
        });

        describe('getServiceAccess()', () => {
            it('Получение прав доступа сервиса', async () => {
                const serviceId = faker.string.uuid();
                const mockResources = [
                    {
                        id: faker.string.uuid(),
                        serviceId,
                        name: 'Resource 1',
                        description: 'Desc 1',
                        ResourceAccess: [
                            {
                                access: {
                                    id: faker.string.uuid(),
                                    userType: 'USER',
                                    source: 'user1',
                                    type: 'READ',
                                    name: 'Read Access',
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                }
                            }
                        ]
                    }
                ];

                const findManyStub = prisma.resource.findMany as sinon.SinonStub;
                findManyStub.resolves(mockResources);

                const result = await serviceService.getServiceAccess(serviceId);

                expect(result).to.be.an('array');
                expect(findManyStub.calledWith({
                    where: {serviceId},
                    include: {
                        ResourceAccess: {
                            include: {access: true}
                        }
                    }
                })).to.be.true;
            });
        });
    });

    describe('ResourceService', () => {
        describe('getAccessList()', () => {
            it('Получение списка доступов по типу', async () => {
                const type = 'groups';
                const mockAccesses: Access[] = [
                    {
                        id: faker.string.uuid(),
                        userType: 'Группы',
                        source: 'group1',
                        type: 'READ',
                        name: 'Group Access',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];

                const findManyStub = prisma.access.findMany as sinon.SinonStub;
                findManyStub.resolves(mockAccesses);

                const result = await resourceService.getAccessList(type);

                expect(result).to.deep.equal(mockAccesses);
                expect(findManyStub.calledOnce).to.be.true;
            });
        });


        describe('createResource()', () => {
            it('Создание ресурса', async () => {
                const resourceData = {
                    name: 'New Resource',
                    description: 'Test Description',
                    serviceId: faker.string.uuid()
                };

                const createdResource: Resource = {
                    id: faker.string.uuid(),
                    ...resourceData,

                };

                const createStub = prisma.resource.create as sinon.SinonStub;
                createStub.resolves(createdResource);

                const result = await resourceService.createResource(resourceData);

                expect(result).to.deep.equal(createdResource);
                expect(createStub.calledOnce).to.be.true;
            });
        });

        describe('saveAccess()', () => {
            it('Сохранение прав доступа для ресурса', async () => {
                const resourceId = faker.string.uuid();
                const accessIds = [faker.string.uuid(), faker.string.uuid()];

                const findUniqueStub = prisma.resource.findUnique as sinon.SinonStub;
                findUniqueStub.resolves({id: resourceId});

                const deleteManyStub = prisma.resourceAccess.deleteMany as sinon.SinonStub;
                deleteManyStub.resolves({count: 2});

                const createManyStub = prisma.resourceAccess.createMany as sinon.SinonStub;
                createManyStub.resolves({count: 2});

                const result = await resourceService.saveAccess(resourceId, accessIds);

                expect(result.success).to.be.true;
                expect(deleteManyStub.calledWith({where: {resourceId}})).to.be.true;
                expect(createManyStub.calledWith({
                    data: accessIds.map(accessId => ({resourceId, accessId})),
                    skipDuplicates: true
                })).to.be.true;
            });
        });

        describe('getResourceAccesses()', () => {
            it('Получение прав доступа ресурса', async () => {
                const resourceId = faker.string.uuid();
                const mockAccesses: ResourceAccess[] = [
                    {
                        id: faker.string.uuid(),
                        resourceId,
                        accessId: faker.string.uuid(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                ];

                const findManyStub = prisma.resourceAccess.findMany as sinon.SinonStub;
                findManyStub.resolves(mockAccesses);

                const result = await resourceService.getResourceAccesses(resourceId);

                expect(result).to.deep.equal(mockAccesses);
                expect(findManyStub.calledWith({
                    where: {resourceId},
                    include: {access: true}
                })).to.be.true;
            });
        });

        describe('deleteResource()', () => {
            it('Удаление ресурса', async () => {
                const resourceId = faker.string.uuid();

                const deleteManyStub = prisma.resourceAccess.deleteMany as sinon.SinonStub;
                deleteManyStub.resolves({count: 2});

                const deleteStub = prisma.resource.delete as sinon.SinonStub;
                deleteStub.resolves({
                    id: resourceId,
                    name: 'Test Resource',
                    description: 'Test',
                    serviceId: faker.string.uuid(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                const result = await resourceService.deleteResource(resourceId);

                expect(deleteManyStub.calledWith({where: {resourceId: resourceId}})).to.be.true;
                expect(deleteStub.calledWith({where: {id: resourceId}})).to.be.true;
            });
        });
    });

    describe('UserService', () => {
        describe('getPaginatedUsers()', () => {
            it('Получение пользователей с пагинацией', async () => {
                const mockUsers: User[] = [
                    {
                        id: faker.string.uuid(),
                        login: 'user1',
                        email: 'user1@test.com',
                        password: 'hashed',
                        prefix: null,
                        lastName: 'Smith',
                        firstName: 'John',
                        middleName: null,
                        suffix: null,
                        department: 'IT',
                        division: 'Development',
                        comment: null,
                        source: AuthSource.LOCAL,
                    }
                ];

                const findManyStub = prisma.user.findMany as sinon.SinonStub;
                findManyStub.resolves(mockUsers);

                const countStub = prisma.user.count as sinon.SinonStub;
                countStub.resolves(1);

                const result = await userService.getPaginatedUsers(1, 10);

                expect(result.users).to.deep.equal(mockUsers);
                expect(result.totalCount).to.equal(1);
                expect(findManyStub.calledOnce).to.be.true;
            });
        });

        describe('createUser()', () => {
            it('Создание пользователя с хешированием пароля', async () => {
                const userData = {
                    login: 'newuser',
                    email: 'newuser@test.com',
                    password: 'plainpassword',
                    lastName: 'Doe',
                    firstName: 'John',
                    department: 'IT'
                };

                const hashedPassword = await bcrypt.hash('plainpassword', 10);
                const createdUser = {
                    id: faker.string.uuid(),
                    ...userData,
                    password: hashedPassword,
                    prefix: null,
                    middleName: null,
                    suffix: null,
                    division: null,
                    comment: null,
                    source: AuthSource.LOCAL,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const createStub = prisma.user.create as sinon.SinonStub;
                createStub.resolves(createdUser);

                const result = await userService.createUser(userData as any);

                expect(result.password).to.equal(hashedPassword);
                expect(createStub.calledOnce).to.be.true;
            });
        });

        describe('getUserById()', () => {
            it('Получение пользователя по ID', async () => {
                const userId = faker.string.uuid();
                const mockUser = {
                    id: userId,
                    login: 'testuser',
                    email: 'test@test.com',
                    password: 'hashed',
                    prefix: null,
                    lastName: 'Test',
                    firstName: 'User',
                    middleName: null,
                    suffix: null,
                    department: 'IT',
                    division: 'Dev',
                    comment: null,
                    source: AuthSource.LOCAL,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    groups: []
                };

                const findUniqueStub = prisma.user.findUnique as sinon.SinonStub;
                findUniqueStub.resolves(mockUser);

                const result = await userService.getUserById(userId);

                expect(result).to.deep.equal(mockUser);
                expect(findUniqueStub.calledWith({
                    where: {id: userId},
                    include: {groups: {include: {group: true}}}
                })).to.be.true;
            });
        });
    });

    describe('AuthService', () => {
        describe('validateUser()', () => {
            it('Успешная валидация пользователя с bcrypt паролем', async () => {
                const hashedPassword = await bcrypt.hash('password123', 10);
                const mockUser = {
                    id: faker.string.uuid(),
                    login: 'testuser',
                    password: hashedPassword,
                    email: 'test@test.com',
                    lastName: 'Test',
                    firstName: 'User'
                } as User;

                const findOneStub = sandbox.stub(authService, 'findOneByLogin');
                findOneStub.resolves(mockUser);

                const result = await authService.validateUser('testuser', 'password123');

                expect(result).to.deep.equal(mockUser);
            });

            it('Успешная валидация пользователя с plain text паролем', async () => {
                const mockUser = {
                    id: faker.string.uuid(),
                    login: 'testuser',
                    password: 'password123', // plain text
                    email: 'test@test.com',
                    lastName: 'Test',
                    firstName: 'User'
                } as User;

                const findOneStub = sandbox.stub(authService, 'findOneByLogin');
                findOneStub.resolves(mockUser);

                const result = await authService.validateUser('testuser', 'password123');

                expect(result).to.deep.equal(mockUser);
            });

            it('Неверный пароль', async () => {
                const mockUser = {
                    id: faker.string.uuid(),
                    login: 'testuser',
                    password: await bcrypt.hash('password123', 10),
                    email: 'test@test.com'
                } as User;

                const findOneStub = sandbox.stub(authService, 'findOneByLogin');
                findOneStub.resolves(mockUser);

                const result = await authService.validateUser('testuser', 'wrongpassword');

                expect(result).to.be.null;
            });
        });

        describe('findOneByLogin()', () => {
            it('Поиск пользователя по логину', async () => {
                const login = 'testuser';
                const mockUser = {
                    id: faker.string.uuid(),
                    login,
                    password: 'hashed',
                    email: 'test@test.com',
                    lastName: 'Test',
                    firstName: 'User'
                } as User;

                const findUniqueStub = prisma.user.findUnique as sinon.SinonStub;
                findUniqueStub.resolves(mockUser);

                const result = await authService.findOneByLogin(login);

                expect(result).to.deep.equal(mockUser);
                expect(findUniqueStub.calledWith({where: {login}})).to.be.true;
            });
        });
    });

    describe('GroupService', () => {
        describe('getAll()', () => {
            it('Возвращает группы с сортировкой по названию', async () => {
                const mockGroups: Group[] = [
                    {
                        id: faker.string.uuid(),
                        name: 'B Group',
                        description: null,
                        comment: null,
                        source: AuthSource.LOCAL,
                    },
                    {
                        id: faker.string.uuid(),
                        name: 'A Group',
                        description: null,
                        comment: null,
                        source: AuthSource.LOCAL,
                    }
                ];

                const findManyStub = prisma.group.findMany as sinon.SinonStub;
                findManyStub.resolves(mockGroups);

                const result = await groupService.getAll();

                expect(result).to.deep.equal(mockGroups);
                expect(findManyStub.calledWith({
                    orderBy: {name: 'asc'}
                })).to.be.true;
            });
        });

        describe('createGroup()', () => {
            it('Создание группы', async () => {
                const groupData = {
                    name: 'New Group',
                    description: 'Test Description',
                    comment: 'Test comment'
                };

                const createdGroup: Group = {
                    id: faker.string.uuid(),
                    ...groupData,
                    source: AuthSource.LOCAL,
                };

                const createStub = prisma.group.create as sinon.SinonStub;
                createStub.resolves(createdGroup);

                const result = await groupService.createGroup(groupData);

                expect(result).to.deep.equal(createdGroup);
                expect(createStub.calledOnce).to.be.true;
            });
        });

        describe('addUserToGroup()', () => {
            it('Добавление пользователя в группу', async () => {
                const groupId = faker.string.uuid();
                const userId = faker.string.uuid();

                const findFirstStub = prisma.groupUser.findFirst as sinon.SinonStub;
                findFirstStub.resolves(null); // Пользователь не в группе

                const createStub = prisma.groupUser.create as sinon.SinonStub;
                createStub.resolves({id: faker.string.uuid(), groupId, userId});

                const result = await groupService.addUserToGroup(groupId, userId);

                expect(result.groupId).to.equal(groupId);
                expect(result.userId).to.equal(userId);
                expect(findFirstStub.calledWith({
                    where: {groupId, userId}
                })).to.be.true;
            });
        });

        describe('removeUserFromGroup()', () => {
            it('Удаление пользователя из группы', async () => {
                const groupId = faker.string.uuid();
                const userId = faker.string.uuid();

                const deleteManyStub = prisma.groupUser.deleteMany as sinon.SinonStub;
                deleteManyStub.resolves({count: 1});

                const result = await groupService.removeUserFromGroup(groupId, userId);

                expect(deleteManyStub.calledWith({
                    where: {groupId, userId}
                })).to.be.true;
            });
        });

        describe('deleteGroup()', () => {
            it('Удаление группы', async () => {
                const groupId = faker.string.uuid();

                const deleteUserManyStub = prisma.groupUser.deleteMany as sinon.SinonStub;
                deleteUserManyStub.resolves({count: 2});

                const deleteRelationManyStub = prisma.groupRelation.deleteMany as sinon.SinonStub;
                deleteRelationManyStub.resolves({count: 1});

                const deleteStub = prisma.group.delete as sinon.SinonStub;
                deleteStub.resolves({
                    id: groupId,
                    name: 'Test Group',
                    description: null,
                    comment: null,
                    source: AuthSource.LOCAL,
                });

                const result = await groupService.deleteGroup(groupId);

                expect(deleteUserManyStub.calledWith({where: {groupId}})).to.be.true;
                expect(deleteRelationManyStub.calledWith({
                    where: {
                        OR: [
                            {parentGroupId: groupId},
                            {childGroupId: groupId}
                        ]
                    }
                })).to.be.true;
                expect(deleteStub.calledWith({where: {id: groupId}})).to.be.true;
            });
        });
    });
});