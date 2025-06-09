import { ParseFilePipeBuilder, UploadedFile } from '@nestjs/common';

import { CustomFileValidator } from '@/modules/media/validators';

export const CustomUploadedFile = () =>
  UploadedFile(
    new ParseFilePipeBuilder().addValidator(new CustomFileValidator()).build({
      fileIsRequired: true,
    }),
  );
