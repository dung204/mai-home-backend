import { ApiProperty } from '@nestjs/swagger';
import { IsString, NotContains } from 'class-validator';

export class DeleteMediaDto {
  @ApiProperty({
    description: 'The name of the file in Cloudinary to delete',
  })
  @IsString({ message: `'name' is required.` })
  @NotContains('/', {
    message: `'name' must not contains illegal '/' character`,
  })
  name!: string;

  @ApiProperty({
    description: 'The folder containing the file to delete',
    required: false,
  })
  folder?: string;
}
