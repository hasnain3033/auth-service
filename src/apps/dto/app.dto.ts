import {
  IsString,
  ArrayNotEmpty,
  IsUrl,
  IsArray,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAppDto {
  @IsUUID()
  developerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  redirectUris: string[];
}

export class UpdateAppDto extends PartialType(CreateAppDto) {}
