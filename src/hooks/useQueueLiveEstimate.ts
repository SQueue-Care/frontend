import { useEffect, useState } from 'react'
import {
  buildLiveEstimateParams,
  getQueueWaitMinutes,
} from '../lib/waitTimeEstimate'
import type { Queue, WaitTimeEstimate } from '../lib/types'
import { usePredictionStore } from '../store/predictionStore'

type WaitQueueInput = Pick<
  Queue,
  | 'status'
  | 'checkInAt'
  | 'createdAt'
  | 'queueDate'
  | 'estimatedWaitMinutes'
  | 'prediction'
  | 'doctorId'
  | 'scheduleId'
  | 'patient'
> & {
  department?: { id: string } | null
  schedule?: { id: string; startTime: string } | null
  id?: string
}

export function useQueueLiveEstimate(queue: WaitQueueInput | null | undefined) {
  const fetchWaitTime = usePredictionStore((s) => s.fetchWaitTime)
  const [liveEstimate, setLiveEstimate] = useState<WaitTimeEstimate | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!queue || !['WAITING', 'CALLED'].includes(queue.status)) {
      setLiveEstimate(null)
      setIsLoading(false)
      return
    }

    if (getQueueWaitMinutes(queue) != null) {
      setLiveEstimate(null)
      setIsLoading(false)
      return
    }

    const params = buildLiveEstimateParams(queue)
    if (!params) {
      setLiveEstimate(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void fetchWaitTime(params).then((estimate) => {
      if (!cancelled) {
        setLiveEstimate(estimate)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [
    queue?.id,
    queue?.status,
    queue?.estimatedWaitMinutes,
    queue?.prediction?.estimatedMin,
    queue?.department?.id,
    queue?.doctorId,
    queue?.scheduleId,
    queue?.schedule?.id,
    queue?.queueDate,
    queue?.patient?.id,
    fetchWaitTime,
  ])

  return { liveEstimate, isLoading }
}
