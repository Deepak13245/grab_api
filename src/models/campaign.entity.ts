import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './task.entity';
import { Benefit } from './benefit.entity';

@Entity()
export class Campaign extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'int',
    unsigned: true,
  })
  maxCashBack: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  minPay: number;

  @Column({
    type: 'timestamp',
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
  })
  expireAt: Date;

  @Column({
    type: 'bool',
  })
  isLive: boolean;

  @OneToMany(type => Task, task => task.campaign, { eager: true })
  tasks: Task[];

  @Column({
    type: 'json',
  })
  tc: string[];

  @Column({
    type: 'json',
  })
  benefitsList: string[];

  @OneToMany(type => Benefit, benefit => benefit.campaign, { eager: true })
  benefits: Benefit[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  isApplicable(): boolean {
    return Date.now() < new Date(this.expireAt).getTime();
  }

  getTasksForType(payType: string): Task[] {
    return this.tasks.filter(t => t.payType === payType);
  }
}
