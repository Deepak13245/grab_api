import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity()
export class Benefit extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Campaign, campaign => campaign.tasks)
  campaign: Campaign;

  @Column()
  benefitType: string;

  @Column({
    type: 'int',
  })
  benefitValue: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
