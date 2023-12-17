import { $fetch } from 'ofetch'
import { consola } from 'consola'
import type { SponsorkitConfig, Sponsorship } from '../../types'

export async function fetchAfdianMonthlySponsors(
  options: SponsorkitConfig['afdian'] = {},
): Promise<Sponsorship[]> {
  const { webAuthToken, exechangeRate = 6.5 } = options

  if (!webAuthToken)
    throw new Error('Afdian web auth_token are required')

  const orders: any[] = []
  const ordersApi = 'https://afdian.net/api/my/sponsored-bill-filter'
  let page = 1
  let has_more
  do {
    const ordersData = await $fetch(ordersApi, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${webAuthToken}`,
      },
      responseType: 'json',
      query: {
        page,
        sort_field: 'update_time',
        sort_value: 'desc',
        is_redeem: '0',
        plan_id: '',
        sign_status: '',
        has_remark: '0',
        status: '',
        order_id: '',
        nick_name: '',
        remark: '',
        express_no: '',
      },
    })
    page += 1
    if (ordersData?.ec !== 200)
      break
    has_more = ordersData.data.has_more
    orders.push(...ordersData.data.list)
  } while (has_more === 1)

  consola.info(`afdian: ${orders.length} orders found`)

  const sponsors: Record<string, {
    plans: {
      isOneTime: boolean
      amount: number
      month: number
      monthlyAmount: number
      beginTime: number
      endTime: number
      isExpired: boolean
    }[]
    id: string
    name: string
    avatar: string
  }> = {}
  orders.forEach((order) => {
    if (!sponsors[order.user.user_id]) {
      sponsors[order.user.user_id] = {
        plans: [],
        id: order.user.user_id,
        name: order.user.name,
        avatar: order.user.avatar,
      }
    }
    const isOneTime = Array.isArray(order.plan) && order.plan.length === 0

    sponsors[order.user.user_id].plans.push({
      isOneTime,
      amount: Number.parseFloat(order.total_amount),
      month: order.month,
      monthlyAmount: Number.parseFloat(order.total_amount) / order.month,
      beginTime: order.time_range.begin_time,
      endTime: order.time_range.end_time,
      isExpired: order.time_range.end_time < Date.now() / 1000,
    })
  })

  const processed = Object.entries(sponsors).map(([userId, userData]): Sponsorship => {
    return {
      sponsor: {
        type: 'User',
        login: userId,
        name: userData.name,
        avatarUrl: userData.avatar,
        linkUrl: `https://afdian.net/u/${userId}`,
      },
      // all_sum_amount is based on cny
      monthlyDollars: userData.plans.every((plan: any) => plan.isExpired)
        ? -1
        : userData.plans.filter(plan => !plan.isExpired).map(plan => plan.monthlyAmount / exechangeRate).reduce((acc, curr) => acc + curr, 0),
      privacyLevel: 'PUBLIC',
      tierName: 'Afdian',
      // ASC
      createdAt: new Date(userData.plans.map(plan => plan.beginTime).sort((a, b) => a - b)[0] * 1000).toISOString(),
      // DESC
      expireAt: new Date(userData.plans.map(plan => plan.beginTime).sort((a, b) => b - a)[0] * 1000).toISOString(),
      // empty string means no plan, consider as one time sponsor
      isOneTime: userData.plans.every((plan: any) => plan.isOneTime),
      provider: 'afdian',
      raw: userData,
    }
  })

  return processed
}
