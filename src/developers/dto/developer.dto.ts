import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDeveloperDto {
  @ApiProperty({
    example: 'jane.doe@acme.dev',
    description: 'The developer’s unique email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Str0ngP@ssw0rd!',
    description: 'A password at least 8 characters long',
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateDeveloperDto extends PartialType(CreateDeveloperDto) {
  @ApiPropertyOptional({
    example: 'jane.doe@acme.dev',
    description: 'The developer’s unique email address (optional)',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'Str0ngP@ssw0rd!',
    description: 'A password at least 8 characters long (optional)',
  })
  password?: string;
}
