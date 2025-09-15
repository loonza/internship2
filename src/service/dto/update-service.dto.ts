import {PartialType} from '@nestjs/mapped-types';
import {CreateServiceDto} from './create-service.dto';
import {IsOptional, IsBoolean, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
    @ApiProperty({
        description: 'Название сервиса',
        example: 'Обновленное название сервиса',
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Описание сервиса',
        example: 'Обновленное описание сервиса',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Статус сервиса (включен/выключен)',
        example: false,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}