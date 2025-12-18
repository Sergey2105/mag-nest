/* import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { YookassaService } from 'src/lib/yookassa/yookassa.service'
import { PrismaService } from 'src/prisma.service'
import { TransactionService } from './transaction.service'

@Injectable()
export class AutoRenewalService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly yookassa: YookassaService,
		private readonly transactionService: TransactionService
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	// @Cron(CronExpression.EVERY_DAY_AT_11AM)
	async autoRenewal() {
		console.log('autoRenewal')
		const subscriptions = await this.prisma.user.findMany({
			where: {
				subscriptionEndDate: {
					lte: new Date(new Date().setHours(23, 59, 59, 999)),
				},
			},
		})

		await Promise.all(
			subscriptions.map(async subscription => {
				const userId = subscription.id

				if (!subscription.isAutoRenewal) {
					return this.prisma.user.update({
						where: {
							id: userId,
						},
						data: {
							subscriptionEndDate: null,
						},
					})
				}

				const lastTransaction = await this.prisma.transaction.findFirst({
					where: {
						userId,
					},
				})

				if (!lastTransaction) {
					return this.prisma.user.update({
						where: {
							id: userId,
						},
						data: {
							subscriptionEndDate: null,
						},
					})
				}

				const amount = lastTransaction.amount

				try {
					const paymentResponse = await this.yookassa.createPaymentBySavedCard({
						currency: 'RUB',
						customerEmail: subscription.email,
						items: [
							{
								description: `Продление подписки`,
								quantity: '1.00',
								amount: {
									value: amount,
									currency: 'RUB',
								},
								vat_code: '1',
							},
						],
						total: amount,
						paymentId: lastTransaction.paymentId,
					})

					await this.transactionService.update({
						payment: paymentResponse,
						transactionId: lastTransaction.id,
						months: 1,
						userId: subscription.id,
					})
				} catch (error) {
					console.log('cancel sub')
					return this.prisma.user.update({
						where: {
							id: userId,
						},
						data: {
							subscriptionEndDate: null,
						},
					})
				}
			})
		)
	}
}
 */
