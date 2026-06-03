import { useEffect, useMemo, useState } from 'react'
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

function buildFetchConfig(queue: WaitQueueInput) {
  if (!['WAITING', 'CALLED'].includes(queue.status)) return null
  if (getQueueWaitMinutes(queue) != null) return null

  const params = buildLiveEstimateParams(queue)
  if (!params) return null

  const key = [
    queue.id,
    queue.status,
    queue.estimatedWaitMinutes,
    queue.prediction?.estimatedMin,
    queue.department?.id,
    queue.doctorId,
    queue.scheduleId,
    queue.schedule?.id,
    queue.queueDate,
    queue.patient?.id,
  ].join(':')

  return { key, params }
}

export function useQueueLiveEstimate(queue: WaitQueueInput | null | undefined) {
  const fetchWaitTime = usePredictionStore((s) => s.fetchWaitTime)
  const fetchConfig = useMemo(() => (queue ? buildFetchConfig(queue) : null), [queue])

  const [fetchResult, setFetchResult] = useState<{
    key: string
    estimate: WaitTimeEstimate | null
  } | null>(null)

  useEffect(() => {
    if (!fetchConfig) return

    let cancelled = false

    void fetchWaitTime(fetchConfig.params).then((estimate) => {
      if (!cancelled) {
        setFetchResult({ key: fetchConfig.key, estimate })
      }
    })

    return () => {
      cancelled = true
    }
  }, [fetchConfig, fetchWaitTime])

  const liveEstimate =
    fetchConfig && fetchResult?.key === fetchConfig.key ? fetchResult.estimate : null
  const isLoading = Boolean(fetchConfig) && fetchResult?.key !== fetchConfig?.key

  return { liveEstimate, isLoading }
}
