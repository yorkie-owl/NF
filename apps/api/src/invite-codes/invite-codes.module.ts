import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteCodeEntity } from './entities/invite-code.entity';
import { InviteRedemptionEntity } from './entities/invite-redemption.entity';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InviteCodeEntity, InviteRedemptionEntity])],
  controllers: [InviteCodesController],
  providers: [InviteCodesService],
  exports: [InviteCodesService],
})
export class InviteCodesModule {}
