import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { Enroll } from './enroll.entity';

@Entity()
export class Redeem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Enroll)
  enroll: Enroll;

  @Column({
    type: 'int',
    unsigned: true,
  })
  taskId: number;

  @ManyToOne(type => Task)
  @JoinColumn()
  task: Task;

  @Column({
    type: 'int',
    unsigned: true,
  })
  amount: number;

  @Column()
  tid: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
