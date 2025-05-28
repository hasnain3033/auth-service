import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Developer } from './developer.entity';
import { User } from './user.entity';

@Entity()
export class App {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Developer, (d) => d.apps)
  developer: Developer;

  @OneToMany(() => User, (user) => user.app)
  users: User[];

  @Column()
  name: string;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column('text', { array: true })
  redirectUris: string[];

  @CreateDateColumn()
  createdAt: Date;
}
