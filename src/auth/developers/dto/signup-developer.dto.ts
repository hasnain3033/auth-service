import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDeveloperDto {
  @ApiProperty({
    example: 'jane.doe@acme.dev',
    description: "Developer's unique email address",
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
