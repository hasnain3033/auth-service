import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { App } from './app.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Developer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => App, (app) => app.developer)
  apps: App[];

  @Column({ type: 'text', nullable: true })
  currentHashedRefreshToken: string | null;
}
