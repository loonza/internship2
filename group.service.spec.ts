import { expect } from 'chai';
import sinon from 'sinon';
import { GroupService } from '../src/group/group.service';
import { PrismaService } from '../src/prisma.service';
import { faker } from '@faker-js/faker/locale/ru';
import { Group, AuthSource } from '@prisma/client';
import sinonChai from 'sinon-chai';
import chai from 'chai';


chai.use(sinonChai);

describe('GroupService', () => {
    let groupService: GroupService;
    let prisma: PrismaService;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        prisma = {
            group: {
                findMany: sandbox.stub(),
                create: sandbox.stub(),
                findUnique: sandbox.stub()
            }
        } as unknown as PrismaService;

        groupService = new GroupService(prisma);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAll()', () => {
        it('should return groups ordered by name', async () => {
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
            expect(findManyStub).to.have.been.calledOnce;
            expect(findManyStub).to.have.been.calledWith({
                orderBy: { name: 'asc' }
            });
        });
    });

    describe('createGroup()', () => {
        it('should create new group with all fields', async () => {
            const groupData = {
                name: 'New Group',
                description: 'Description',
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
            expect(createStub).to.have.been.calledOnce;
            expect(createStub).to.have.been.calledWith({
                data: groupData
            });
        });
    });
});

