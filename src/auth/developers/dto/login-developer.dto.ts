import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDeveloperDto {
  @ApiProperty({
    example: 'jane.doe@acme.dev',
    description: "Developer's email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Developer password' })
  @IsString()
  @MinLength(8)
  password: string;
}
