import { expect } from 'chai';
import sinon from 'sinon';
import { GroupController } from '../src/group/group.controller';
import { GroupService } from '../src/group/group.service';
import { faker } from '@faker-js/faker/locale/ru';
import { AuthSource } from '@prisma/client';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import { Request, Response } from 'express';
import { NotFoundException } from '@nestjs/common';

chai.use(sinonChai);

describe('GroupController', () => {
    let groupController: GroupController;
    let groupService: GroupService;
    let sandbox: sinon.SinonSandbox;


    const mockRequest = (sessionData: any = {}, query: any = {}, params: any = {}, body: any = {}) => ({
        session: { user: sessionData },
        query,
        params,
        body
    } as unknown as Request);

    const mockResponse = () => {
        const res = {} as Response;
        res.redirect = sinon.stub().returns(res);
        res.render = sinon.stub().returns(res);
        res.status = sinon.stub().returns(res);
        res.json = sinon.stub().returns(res);
        return res;
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        groupService = {
            getAll: sandbox.stub(),
            createGroup: sandbox.stub(),
            getByIdWithMembers: sandbox.stub(),
            updateGroup: sandbox.stub(),
            deleteGroup: sandbox.stub()
        } as unknown as GroupService;
        groupController = new GroupController(groupService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('list()', () => {
        it('should render groups with pagination and search', async () => {

            const mockGroups = Array.from({ length: 10 }, (_, i) => ({
                id: faker.string.uuid(),
                name: `Group ${i}`,
                description: i % 2 ? faker.lorem.sentence() : null,
                comment: i % 3 ? faker.lorem.words() : null,
                source: i % 2 ? AuthSource.LOCAL : AuthSource.DOMAIN
            }));


            (groupService.getAll as sinon.SinonStub).resolves(mockGroups);


            const req = mockRequest(
                { id: 'user1', name: 'Test User' },
                { page: '2', perPage: '3', search: 'Group 1' }
            );
            const res = mockResponse();


            await groupController.list(req, res, req.query.page, req.query.perPage);


            expect(groupService.getAll).to.have.been.calledOnce;
            expect(res.render).to.have.been.calledOnce;
            expect(res.render).to.have.been.calledWith('groups', {
                groups: sinon.match.array,
                currentPage: 2,
                totalPages: sinon.match.number,
                perPage: 3,
                searchQuery: 'Group 1',
                user: { id: 'user1', name: 'Test User' },
                jsonGroups: sinon.match.string
            });
        });
    });

    describe('createGroup()', () => {
        it('should create group and redirect', async () => {
            const groupData = {
                name: faker.company.name(),
                description: faker.lorem.sentence(),
                comment: faker.lorem.words()
            };

            const req = mockRequest({}, {}, {}, groupData);
            const res = mockResponse();

            await groupController.createGroup(groupData, res);

            expect(groupService.createGroup).to.have.been.calledOnceWith({
                name: groupData.name,
                description: groupData.description,
                comment: groupData.comment
            });
            expect(res.redirect).to.have.been.calledOnceWith('/groups');
        });
    });

    describe('getGroup()', () => {
        it('should render group details', async () => {
            const groupId = faker.string.uuid();
            const mockGroup = {
                id: groupId,
                name: faker.company.name(),
                users: [{
                    user: {
                        lastName: faker.person.lastName(),
                        firstName: faker.person.firstName(),
                        middleName: faker.person.middleName()
                    }
                }],
                children: [{
                    childGroup: {
                        name: faker.company.name()
                    }
                }]
            };

            (groupService.getByIdWithMembers as sinon.SinonStub).resolves(mockGroup);

            const req = mockRequest({ user: 'test' }, {}, { id: groupId });
            const res = mockResponse();

            await groupController.getGroup(groupId, req);

            expect(groupService.getByIdWithMembers).to.have.been.calledOnceWith(groupId);
            expect(res.render).to.have.been.calledOnceWith('groupView', {
                group: sinon.match({
                    id: groupId,
                    members: sinon.match.array
                }),
                user: { user: 'test' }
            });
        });

        it('should throw 404 if group not found', async () => {
            (groupService.getByIdWithMembers as sinon.SinonStub).resolves(null);
            const req = mockRequest({}, {}, { id: 'invalid' });
            const res = mockResponse();

            try {
                await groupController.getGroup('invalid', req);
                expect.fail('Should have thrown NotFoundException');
            } catch (e) {
                if (e instanceof NotFoundException) {
                    expect(e.message).to.equal('Группа не найдена');
                } else {
                    expect.fail('Expected NotFoundException but got ' + e);
                }
            }
        });
    });

    describe('getGroupMembers()', () => {
        it('should return formatted members list', async () => {
            const groupId = faker.string.uuid();
            const mockGroup = {
                users: [
                    { user: { lastName: 'Иванов', firstName: 'Иван', middleName: 'Иванович' } },
                    { user: { lastName: 'Петров', firstName: 'Пётр', middleName: null } }
                ],
                children: [
                    { childGroup: { name: 'Child Group 1' } },
                    { childGroup: { name: 'Child Group 2' } }
                ]
            };

            (groupService.getByIdWithMembers as sinon.SinonStub).resolves(mockGroup);

            const members = await groupController.getGroupMembers(groupId);

            expect(members).to.deep.equal([
                'Иванов Иван Иванович',
                'Петров Пётр',
                'Child Group 1',
                'Child Group 2'
            ]);
        });
    });

    describe('updateGroup()', () => {
        it('should update group and redirect', async () => {
            const groupId = faker.string.uuid();
            const updateData = {
                name: 'Updated Name',
                description: 'New description'
            };

            const req = mockRequest({}, {}, { id: groupId }, updateData);
            const res = mockResponse();

            await groupController.updateGroup(groupId, updateData, res);

            expect(groupService.updateGroup).to.have.been.calledOnceWith(groupId, updateData);
            expect(res.redirect).to.have.been.calledOnceWith('/groups');
        });
    });

    describe('deleteGroup()', () => {
        it('should delete group and redirect', async () => {
            const groupId = faker.string.uuid();
            const res = mockResponse();

            await groupController.deleteGroup(groupId, res);

            expect(groupService.deleteGroup).to.have.been.calledOnceWith(groupId);
            expect(res.redirect).to.have.been.calledOnceWith('/groups');
        });
    });
});