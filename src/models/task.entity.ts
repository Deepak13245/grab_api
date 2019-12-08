import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  payType: string;

  @Column({
    type: 'int',
    unsigned: true,
  })
  count: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  days: number;

  @ManyToOne(type => Campaign, campaign => campaign.tasks)
  campaign: Campaign;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
