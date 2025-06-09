import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';

import { configs } from '@/base/configs';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: configs.EMAIL,
      template: {
        dir: join(__dirname, './templates/'),
        adapter: new EjsAdapter(),
      },
      defaults: {
        from: 'Mai Home <no-reply@maihome.info.vn>',
      },
    }),
  ],
})
export class EmailModule {}
