import {ApiProperty} from '@nestjs/swagger';

export class CreateGroupDto {
    @ApiProperty({
        description: 'Название группы',
        example: 'Администраторы',
        required: true
    })
    name!: string;

    @ApiProperty({
        description: 'Описание группы',
        example: 'Группа администраторов системы',
        required: false
    })
    description?: string;

    @ApiProperty({
        description: 'Комментарий к группе',
        example: 'Для внутреннего использования',
        required: false
    })
    comment?: string;
}