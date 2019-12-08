import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Enroll } from './enroll.entity';

@Entity()
@Unique('enroll', ['enroll'])
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  enrollId: number;

  @ManyToOne(type => Enroll)
  @JoinColumn()
  enroll: Enroll;

  @Column({
    type: 'int',
    unsigned: true,
  })
  amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
