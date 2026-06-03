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

  const targetAtMs = context?.targetAt.getTime()
  const startedAtMs = context?.startedAt.getTime()

  useEffect(() => {
    if (targetAtMs == null || startedAtMs == null) return

    const tick = () => setNow(Date.now())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetAtMs, startedAtMs])

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
