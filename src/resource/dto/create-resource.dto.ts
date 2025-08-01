import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateResourceDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsUUID()
    serviceId?: string;
}