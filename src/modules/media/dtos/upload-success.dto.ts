import { ApiProperty } from '@nestjs/swagger';

export class UploadSuccessDto {
  @ApiProperty({
    description: 'The original name of the uploaded media',
    example: 'example.png',
  })
  originalName!: string;

  @ApiProperty({
    description: 'The name of the asset after the original media is uploaded',
    example: 'qca1kzxc5c6av7fvpqaz',
  })
  name!: string;

  @ApiProperty({
    description: 'The URL of the uploaded media',
    example:
      'https://res.cloudinary.com/dexevicby/image/upload/v1733299244/qca1kzxc5c6av7fvpqaz.webp',
  })
  url!: string;
}
