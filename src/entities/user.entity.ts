import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { App } from './app.entity';
import { Session } from './session.entity';
import { Exclude } from 'class-transformer';
import { TenantScoped } from 'src/common/tenant.entity';

@Entity()
export class User extends TenantScoped {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => App, (a) => a.users, { onDelete: 'CASCADE' })
  app!: App;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ select: false })
  @Exclude()
  passwordHash!: string;

  @Column({ type: 'text', nullable: true })
  currentHashedRefreshToken!: string | null;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
