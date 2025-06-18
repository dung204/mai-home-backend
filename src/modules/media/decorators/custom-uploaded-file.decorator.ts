import { ParseFilePipeBuilder, UploadedFiles } from '@nestjs/common';

import { CustomFileValidator } from '@/modules/media/validators';

export const CustomUploadedFiles = () =>
  UploadedFiles(
    new ParseFilePipeBuilder().addValidator(new CustomFileValidator()).build({
      fileIsRequired: true,
    }),
  );
