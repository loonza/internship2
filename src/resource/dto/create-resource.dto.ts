import {IsString, IsOptional, IsUUID} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateResourceDto {
    @ApiProperty({description: 'Название ресурса'})
    @IsString()
    name!: string;

    @ApiProperty({description: 'Описание ресурса', required: false})
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({description: 'Тип ресурса', required: false})
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({description: 'ID сервиса'})
    @IsUUID()
    serviceId!: string;
}