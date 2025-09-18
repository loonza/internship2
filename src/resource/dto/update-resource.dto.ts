import {PartialType} from '@nestjs/mapped-types';
import {CreateResourceDto} from './create-resource.dto';
import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString, IsUUID} from "class-validator";

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
    @ApiProperty({description: 'Название ресурса'})
    @IsString()
    name!: string;

    @ApiProperty({description: 'Описание ресурса', required: false})
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({description: 'ID сервиса'})
    @IsUUID()
    serviceId!: string;
}