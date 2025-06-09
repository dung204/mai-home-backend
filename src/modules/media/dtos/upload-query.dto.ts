import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UploadQueryDto {
  @ApiProperty({
    description: 'The folder in Cloudinary to save the file',
    required: false,
  })
  @IsOptional()
  folder?: string;
}
