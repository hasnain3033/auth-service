import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { App } from './app.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
