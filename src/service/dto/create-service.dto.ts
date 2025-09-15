import {IsString, IsBoolean, IsOptional} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateServiceDto {
    @ApiProperty({
        description: 'Название сервиса',
        example: 'Мой сервис',
        required: true
    })
    @IsString()
    name!: string;

    @ApiProperty({
        description: 'Описание сервиса',
        example: 'Описание моего сервиса',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Статус сервиса (включен/выключен)',
        example: true,
        required: false,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}