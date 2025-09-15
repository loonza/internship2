import {faker} from '@faker-js/faker';
import {PrismaClient, User, Group, Service, Resource, Access} from '@prisma/client';
import {exit} from 'node:process';

const prisma = new PrismaClient();

async function main() {

    await prisma.resourceAccess.deleteMany();
    await prisma.access.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.service.deleteMany();
    await prisma.groupUser.deleteMany();
    await prisma.groupRelation.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();

    const allUsers: User[] = [];
    for (let i = 0; i < 50; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        const user = await prisma.user.create({
            data: {
                login: faker.internet.userName({firstName, lastName}),
                email: faker.internet.email({firstName, lastName}),
                password: faker.internet.password(),
                lastName,
                firstName,
                middleName: faker.person.middleName(),
                department: faker.commerce.department(),
                division: faker.company.name(),
                source: faker.helpers.arrayElement(['LOCAL', 'DOMAIN', 'ACTIVE_DIRECTORY', 'DOMAIN1', 'DOMAIN2', 'DOMAIN3']),
            },
        });
        allUsers.push(user);
    }


    const groupNames = [
        'Отдел разработок базовых технологий',
        'Отдел новых технологий производства',
        'Отдел корпоративных решений',
        'Отдел продвижения программных технологий',
        'Отдел разработки веб-технологий',
        'Отдел по работе с ФЭД',
        'Отдел разработки прикладных технологий',
        'Отдел внедрения и эксплуатации СУНТД',
    ];

    const groups: Group[] = await Promise.all(groupNames.map(name =>
        prisma.group.create({
            data: {
                name,
                description: faker.lorem.sentence(),
                source: faker.helpers.arrayElement(['LOCAL', 'DOMAIN', 'ACTIVE_DIRECTORY', 'DOMAIN1', 'DOMAIN2', 'DOMAIN3']),
            },
        })
    ));


    for (const user of allUsers) {
        const randomGroups = faker.helpers.arrayElements(groups, faker.number.int({min: 1, max: 3}));
        for (const group of randomGroups) {
            await prisma.groupUser.create({
                data: {
                    userId: user.id,
                    groupId: group.id,
                },
            });
        }
    }


    for (let i = 0; i < groups.length / 2; i++) {
        const parent = groups[i];
        const child = groups[groups.length - 1 - i];
        await prisma.groupRelation.create({
            data: {
                parentGroupId: parent.id,
                childGroupId: child.id,
            },
        });
    }


    const serviceNames = new Set<string>();
    const services: Service[] = await Promise.all(
        Array.from({length: 10}).map(async () => {
            let name;
            do {
                name = `${faker.company.buzzNoun()} Service ${faker.number.int({min: 1, max: 100})}`;
            } while (serviceNames.has(name));

            serviceNames.add(name);

            return prisma.service.create({
                data: {
                    name,
                    description: faker.company.catchPhrase(),
                    enabled: faker.datatype.boolean(),
                },
            });
        })
    );


    const allResources: Resource[] = [];
    for (const service of services) {
        const resourceCount = faker.number.int({min: 1, max: 5});
        for (let i = 0; i < resourceCount; i++) {
            const resource = await prisma.resource.create({
                data: {
                    name: `${service.name.split(' Service')[0]} Resource ${i + 1}`,
                    description: faker.lorem.sentence(),
                    serviceId: service.id,
                },
            });
            allResources.push(resource);
        }
    }

    for (const user of allUsers) {
        const userResources = faker.helpers.arrayElements(allResources, faker.number.int({min: 1, max: 3}));

        const access = await prisma.access.create({
            data: {
                userType: 'USER',
                source: user.id,
                type: faker.helpers.arrayElement(['READ', 'WRITE', 'ADMIN']),
                name: `Доступ для ${user.firstName} ${user.lastName}`,
            }
        });

        for (const resource of userResources) {
            await prisma.resourceAccess.create({
                data: {
                    resourceId: resource.id,
                    accessId: access.id,
                }
            });
        }
    }


    for (const group of groups) {
        const groupResources = faker.helpers.arrayElements(allResources, faker.number.int({min: 1, max: 5}));

        const access = await prisma.access.create({
            data: {
                userType: 'GROUP',
                source: group.id,
                type: faker.helpers.arrayElement(['READ', 'WRITE', 'ADMIN']),
                name: `Групповой доступ для ${group.name}`,
            }
        });

        for (const resource of groupResources) {
            await prisma.resourceAccess.create({
                data: {
                    resourceId: resource.id,
                    accessId: access.id,
                }
            });
        }
    }

    console.log(' Данные сгенерированы');
    console.log(` Пользователей: ${allUsers.length}`);
    console.log(` Групп: ${groups.length}`);
    console.log(` Сервисов: ${services.length}`);
    console.log(` Ресурсов: ${allResources.length}`);
}

main()
    .catch((e) => {
        console.error(' Ошибка при заполнении:', e);
        exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });