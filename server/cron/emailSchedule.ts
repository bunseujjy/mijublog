import { createDailyHighlightScheduler } from "./scheduler/dailyHightlightScheduler"

export default defineNitroPlugin(() => {
  console.log('Email scheduler plugin initialized')

  // Daily highlight emails - runs at 9:47 UTC
  const dailyHighlightJob = createDailyHighlightScheduler('47 9 * * *')
  console.log('Next daily highlight email run:', dailyHighlightJob.nextRun())

  // Add more schedulers here as needed
})