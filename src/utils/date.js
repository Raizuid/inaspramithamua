import { format, parse } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
export const TZ='Asia/Jakarta'
export const todayISO=()=>formatInTimeZone(new Date(),TZ,'yyyy-MM-dd')
export const dateLabel=d=>format(parse(d,'yyyy-MM-dd',new Date()),'dd MMM yyyy')
export const fullDateLabel=d=>format(parse(d,'yyyy-MM-dd',new Date()),'EEEE, dd MMMM yyyy')
export const idDate=new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})
export const rupiah=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0)
export const appointmentInstant=(date,time)=>fromZonedTime(`${date} ${time.slice(0,5)}`,TZ)
export const isToday=(a)=>a.appointment_date===todayISO()
export const statusOf=a=>{const now=new Date(), t=appointmentInstant(a.appointment_date,a.appointment_time); return t<now?'Selesai':isToday(a)?'Today':'Upcoming'}
export const monthBounds=()=>{const now=new Date();return {start:formatInTimeZone(now,TZ,'yyyy-MM-01'),end:formatInTimeZone(now,TZ,'yyyy-MM-dd')}}
