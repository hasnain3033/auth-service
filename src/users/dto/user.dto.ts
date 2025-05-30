import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  appId: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1-202-555-0147', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'superSecret123' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  appId?: string;

  @ApiPropertyOptional({ example: 'alice@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '+1-202-555-0147' })
  phone?: string;

  @ApiPropertyOptional({ example: 'superSecret123' })
  password?: string;
}
