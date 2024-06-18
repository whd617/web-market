import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        cb(null, true);
      },
    }),
  )
  async UploadedFile(@UploadedFile() file: Express.Multer.File) {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
    try {
      const originalname = file.originalname.replace(/\s+/g, '-');
      const fullPath = 'images/' + originalname;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: fullPath,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );
      const makeUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullPath}`;
      const url = encodeURI(makeUrl); // URL 인코딩 적용
      // 이미지 형식의 url을 json으로 변경
      return { url };
    } catch (e) {
      return null;
    }
  }
}
