import {PartialType} from '@nestjs/mapped-types';
import {CreateUserDto} from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    login?: string;
    email?: string;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    department?: string;
    division?: string;
    comment?: string;
}