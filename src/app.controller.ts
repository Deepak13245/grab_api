import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import IPayRequest from './requests/pay.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Post('/enroll/:id')
  enroll(@Param('id') campaignId, @Body('userId') userId: number) {
    return this.appService.enroll(userId, campaignId);
  }

  @Get('/campaigns')
  listCampaigns(@Query('userId') userId: number) {
    return this.appService.listCampaigns(userId);
  }

  @Get('/coupons')
  listCoupons(@Query('userId') userId: number) {
    return this.appService.listCoupons(userId);
  }

  @Post('/pay')
  onPayment(@Body() data: IPayRequest) {
    return this.appService.onPayment(data);
  }
}
