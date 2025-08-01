import {
    IsString,
    IsEmail,
    MinLength,
    IsOptional,
    IsDefined
} from 'class-validator';

export class CreateUserDto {
    @IsDefined()
    @IsString()
    firstName!: string;

    @IsDefined()
    @IsString()
    lastName!: string;

    @IsOptional()
    @IsString()
    middleName?: string;

    @IsDefined()
    @IsString()
    login!: string;

    @IsDefined()
    @IsString()
    @MinLength(6)
    password!: string;

    @IsDefined()
    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    subdivision?: string;

    @IsOptional()
    @IsString()
    comment?: string;
}