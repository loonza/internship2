import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}