import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateGroupDto } from './create-group.dto';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
    @ApiProperty({
        description: 'Комментарий к изменению',
        example: 'Обновлено по запросу',
        required: false
    })
    comment?: string;
}