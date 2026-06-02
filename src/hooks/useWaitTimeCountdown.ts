import { useEffect, useMemo, useState } from 'react'
import type { WaitTimeEstimate } from '../lib/types'
import {
  buildWaitTimeContext,
  computeWaitCountdown,
  type WaitQueueInput,
  type WaitTimeContext,
} from '../lib/waitTimeEstimate'

export function useWaitTimeCountdown(
  queue: WaitQueueInput | null | undefined,
  liveEstimate?: WaitTimeEstimate | null,
): {
  context: WaitTimeContext | null
  countdown: ReturnType<typeof computeWaitCountdown> | null
  isActive: boolean
} {
  const [now, setNow] = useState(() => Date.now())

  const context = useMemo(
    () => (queue ? buildWaitTimeContext(queue, liveEstimate) : null),
    [queue, liveEstimate],
  )

  useEffect(() => {
    if (!context) return

    const tick = () => setNow(Date.now())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [context?.targetAt.getTime(), context?.startedAt.getTime()])

  const countdown = useMemo(() => {
    if (!context) return null
    return computeWaitCountdown(context.targetAt, now)
  }, [context, now])

  return {
    context,
    countdown,
    isActive: context != null && countdown != null,
  }
}
