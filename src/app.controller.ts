import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { AppService } from "./app.service";
import { SampleDto } from "./sample.dto";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const ImageFileFilter = (req, file, callback): MulterOptions => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    const err = new UnsupportedMediaTypeException(
      "Only static image files are supported"
    );
    return callback(err, false);
  }
  callback(null, true);
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  sayHello() {
    return this.appService.getHello();
  }

  @UseInterceptors(FileInterceptor("file"))
  @Post("file")
  uploadFile(
    @Body() body: SampleDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return {
      body,
      file: file.buffer.toString(),
    };
  }

  @UseInterceptors(FileInterceptor("file"))
  @Post("file/json-file")
  uploadJSONFileAndPassValidation(
    @Body() body: SampleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: "json",
        })
        .build({
          fileIsRequired: false,
        })
    )
    file?: Express.Multer.File
  ) {
    return {
      body,
      file: file?.buffer.toString(),
    };
  }

  @UseInterceptors(FileInterceptor("image", { fileFilter: ImageFileFilter }))
  @Post("file/image")
  uploadImageAndPassValidation(
    @Body() body: SampleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        })
    )
    file?: Express.Multer.File
  ) {
    return {
      body,
      file: file?.buffer.toString(),
    };
  }

  @UseInterceptors(
    FilesInterceptor("images", 4, { fileFilter: ImageFileFilter })
  )
  @Post("file/images")
  uploadMultipleImagesAndPassValidation(
    @Body() body: SampleDto,
    @UploadedFiles()
    images?: Array<Express.Multer.File>
  ) {
    const response = [];
    images.forEach((file) => {
      const fileResponse = {
        originalname: file.originalname,
        size: file.size,
      };
      response.push(fileResponse);
    });
    return {
      body,
      images: response,
    };
  }
}
