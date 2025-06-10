import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'superSecret123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
