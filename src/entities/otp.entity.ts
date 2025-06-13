import { TenantScoped } from 'src/common/tenant.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
export type UserType = 'developer' | 'appUser';
export type OtpPurpose =
  | 'email_otp'
  | 'sms_otp'
  | 'auth_app' // for future TOTP scenarios
  | 'backup_code'; // for future backup codes

@Entity()
@Index(['userId', 'userType', 'purpose', 'isUsed', 'expiresAt'])
export class Otp extends TenantScoped {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 32 })
  userType!: UserType;

  @Column({ type: 'varchar', length: 32 })
  purpose!: OtpPurpose;

  @Column({ type: 'varchar', length: 128 })
  codeHash!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  isUsed!: boolean;

  @Column({ type: 'varchar', length: 256, nullable: true })
  sentTo!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
