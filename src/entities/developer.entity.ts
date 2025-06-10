import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { App } from './app.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Developer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  @Exclude()
  passwordHash!: string;

  @OneToMany(() => App, (app) => app.developer, { onDelete: 'CASCADE' })
  apps!: App[];

  @Column({ type: 'text', nullable: true })
  currentHashedRefreshToken!: string | null;

  @Column({ default: false })
  isEmailVerified!: boolean; // ← new flag

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
