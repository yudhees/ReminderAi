import moment from 'moment'

export const SNOOZE_OPTIONS = [
  { label: '10 minutes', minutes: 10 },
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '3 hours', minutes: 180 },
  { label: '1 day', minutes: 1440 },
]

/** "4:35 PM", or "tomorrow 4:05 PM" when the snooze crosses midnight. */
export const snoozeUntilLabel = (minutes: number, from: number = Date.now()) => {
  const at = moment(from).add(minutes, 'minutes')
  return at.isSame(moment(from), 'day') ? at.format('h:mm A') : `tomorrow ${at.format('h:mm A')}`
}
