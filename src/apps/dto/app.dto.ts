import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'The UUID of the developer who owns this app',
  })
  @IsUUID()
  developerId: string;

  @ApiProperty({
    example: 'My Awesome App',
    description: 'A human-friendly name for the application',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: ['https://myapp.com/callback', 'https://myapp.io/redirect'],
    description: 'Allowed OAuth2 redirect URIs',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  redirectUris: string[];
}

export class UpdateAppDto extends PartialType(CreateAppDto) {
  @ApiPropertyOptional({
    example: 'e48c377b-3ced-4b5b-9e9e-d27c6ee12ec8',
    description: 'The UUID of the developer who owns this app (optional)',
  })
  developerId?: string;

  @ApiPropertyOptional({
    example: 'My Awesome App',
    description: 'A human-friendly name for the application (optional)',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'client_abc123',
    description: 'Public client identifier (optional)',
  })
  clientId?: string;

  @ApiPropertyOptional({
    example: 'secret_xyz789',
    description: 'Confidential client secret (optional)',
  })
  clientSecret?: string;

  @ApiPropertyOptional({
    example: ['https://myapp.com/callback', 'https://myapp.io/redirect'],
    description: 'Allowed OAuth2 redirect URIs (optional)',
    type: [String],
  })
  redirectUris?: string[];
}
