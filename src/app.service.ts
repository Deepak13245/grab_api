import { HttpException, Injectable } from '@nestjs/common';
import { User } from './models/user.entity';
import { Campaign } from './models/campaign.entity';
import { Enroll } from './models/enroll.entity';
import IPayRequest from './requests/pay.interface';
import { Redeem } from './models/redeem.entity';
import { Coupon } from './models/coupon.entity';
import { In, LessThanOrEqual, MoreThan } from 'typeorm';

@Injectable()
export class AppService {
  async enroll(userId: number, campaignId: number) {
    const user = await User.findOne(userId);
    const campaign = await Campaign.findOne(campaignId);
    if (!campaign.isApplicable()) {
      throw new HttpException({ message: 'Cannot enroll to this campaign' }, 400);
    }
    const enroll = new Enroll();
    enroll.campaign = campaign;
    enroll.user = user;
    await enroll.save();
    return { message: 'success' };
  }

  async listCoupons(userId: number) {
    const user = await User.findOne(userId);
    const enrolls = user.enrolls.filter(e => e.completed());
    if (enrolls.length === 0) {
      return [];
    }
    const coupons = await Coupon.find({
      where: {
        enrollId: In(enrolls.map(e => e.id)),
      },
    });
    return coupons.map(c => {
      const enroll = enrolls.find(e => e.id === c.enrollId);
      return {
        name: enroll.campaign.description,
        amount: c.amount,
        createdAt: c.createdAt,
      };
    });
  }

  async listCampaigns(userId: number) {
    const campaigns = await Campaign.find({
      where: {
        startDate: LessThanOrEqual(new Date()),
        expireAt: MoreThan(new Date()),
      },
    });
    const user = await User.findOne(userId);
    const completedSet = new Set([...user.enrolls.filter(e => e.completed()).map(e => e.campaign.id)]);
    const enrolledSet = new Set([...user.enrolls.filter(e => !e.completed()).map(e => e.campaign.id)]);
    const enrolled = campaigns.filter(c => enrolledSet.has(c.id) && !completedSet.has(c.id));
    const unenrolled = campaigns.filter(c => !enrolledSet.has(c.id) && !completedSet.has(c.id));
    const redeemed = user.enrolls.filter(e => enrolledSet.has(e.campaign.id) && !completedSet.has(e.campaign.id)).reduce((acc, e) => {
      acc[e.campaign.id] = e.groupRedeems();
      return acc;
    }, {});
    return {
      unenrolled: unenrolled.map(c => {
        return {
          id: c.id,
          name: c.description,
          tasks: c.tasks.map(t => {
            return {
              name: t.description,
              count: t.count,
            };
          }),
          tc: c.tc,
          benefits: c.benefitsList,
        };
      }),
      enrolled: enrolled.map(c => {
        return {
          id: c.id,
          name: c.description,
          tasks: c.tasks.map(t => {
            return {
              name: t.description,
              count: t.count,
              complete: (redeemed[c.id][t.id] || []).length,
            };
          }),
          tc: c.tc,
          count: c.tasks.reduce((acc, t) => acc + t.count, 0),
          complete: c.tasks.reduce((acc, t) => acc + (redeemed[c.id][t.id] || []).length, 0),
          benefits: c.benefitsList,
        };
      }),
    };
  }

  async onPayment(req: IPayRequest) {
    const user = await User.findOne(req.userId);
    const applicable = user.enrolls.filter(e => e.campaign.isApplicable() && req.amount > e.campaign.minPay);
    if (applicable.length === 0) {
      return { message: 'NA' };
    }
    const [first] = applicable.filter(e => e.applicableTasks(req.payType).length > 0);
    if (!first) {
      return { message: 'NA' };
    }
    const [task] = first.applicableTasks(req.payType);
    const redeem = new Redeem();
    redeem.task = task;
    redeem.enroll = first;
    redeem.amount = +req.amount;
    redeem.tid = req.tid;
    await redeem.save();
    await first.reload();
    const coupon = first.completed();
    let cashback = 0;
    if (coupon) {
      cashback = await this.redeemCoupon(first);
    }
    return { message: 'success', coupon, amount: cashback };
  }

  private async redeemCoupon(enroll: Enroll) {
    const total = enroll.redeems.reduce((acc, redeem) => acc + redeem.amount, 0);
    const totalCashback = enroll.campaign.benefits.reduce((acc, benefit) => {
      switch (benefit.benefitType) {
        case 'flat_cashback':
          return benefit.benefitValue;
        case 'order_percentage':
          return benefit.benefitValue * total / 100;
        case 'max_cashback':
          return Math.floor(Math.random() * benefit.benefitValue);
        default:
          return 0;
      }
    }, 0);
    const cashback = Math.min(enroll.campaign.maxCashBack, totalCashback);
    const coupon = new Coupon();
    coupon.amount = cashback;
    coupon.enroll = enroll;
    await coupon.save();
    return cashback;
  }
}
