import { DynamicModule, Global, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadModuleOptions } from './uploads.interface';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Module({})
@Global()
export class UploadsModule {
  static forRoot(options: UploadModuleOptions): DynamicModule {
    return {
      module: UploadsModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
      ],
      controllers: [UploadsController],
    };
  }
}
