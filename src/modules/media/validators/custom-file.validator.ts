import { FileValidator } from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';

import { FileUtils } from '@/base/utils';

export class CustomFileValidator extends FileValidator {
  constructor() {
    super({});
  }

  isValid(file: IFile): boolean {
    if (!/^(image|audio|video)\/.+$/g.test(file.mimetype)) return false;

    switch (file.mimetype.split('/')[0]) {
      case 'image':
        return file.size <= FileUtils.MAX_IMAGE_FILE_SIZE_IN_BYTES;
      case 'audio':
      case 'video':
        return file.size <= FileUtils.MAX_VIDEO_FILE_SIZE_IN_BYTES;
      default:
        return false;
    }
  }
  buildErrorMessage(file: IFile): string {
    if (!/^(image|audio|video)\/.+$/g.test(file.mimetype))
      return 'File type is not supported, expect image/* or video/* or audio/*';

    switch (file.mimetype.split('/')[0]) {
      case 'image':
        return 'Image file size must not exceed 10MB';
      case 'audio':
      case 'video':
        return 'Video/Audio file size must not exceed 50MB';
      default:
        return 'Unknown error';
    }
  }
}
