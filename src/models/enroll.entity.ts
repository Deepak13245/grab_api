import { BaseEntity, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Campaign } from './campaign.entity';
import { User } from './user.entity';
import { Redeem } from './redeem.entity';
import { Task } from './task.entity';
import moment = require('moment');

@Entity()
@Unique('enrollment', ['user', 'campaign'])
export class Enroll extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User)
  user: User;

  @ManyToOne(type => Campaign, { eager: true })
  campaign: Campaign;

  @OneToMany(type => Redeem, redeem => redeem.enroll, { eager: true })
  redeems: Redeem[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  groupRedeems() {
    return this.redeems.reduce((acc, redeem) => {
      acc[redeem.taskId] = [...(acc[redeem.taskId] || []), redeem];
      return acc;
    }, {});
  }

  completedTasks(): Task[] {
    const redeems = this.groupRedeems();
    return this.campaign.tasks.filter(t => (redeems[t.id] || []).length === t.count);
  }

  inCompleteTasks(): Task[] {
    const redeems = this.groupRedeems();
    return this.campaign.tasks.filter(t => (redeems[t.id] || []).length < t.count);
  }

  completed(): boolean {
    return this.inCompleteTasks().length === 0;
  }

  applicableTasks(payType: string): Task[] {
    const redeems = this.groupRedeems();
    return this.campaign.tasks.filter(t => t.payType === payType)
      .filter(t => (redeems[t.id] || [] ).length < t.count)
      .filter(t => moment(this.createdAt).diff(moment(), 'days') <= t.count);
  }
}
