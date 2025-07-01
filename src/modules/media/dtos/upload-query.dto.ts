import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class UploadQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  fixed?: boolean;

  @ApiProperty({
    description: 'The folder in Cloudinary to save the file',
    required: false,
  })
  @IsOptional()
  folder?: string;
}

export class UploadFromUrlDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  fixed?: boolean;

  @ApiProperty({
    description: 'The folder in Cloudinary to save the file',
    required: false,
  })
  @IsOptional()
  folder?: string;

  @ApiProperty({
    description: 'The URL to upload',
  })
  @IsNotEmpty()
  @IsUrl()
  url!: string;
}
