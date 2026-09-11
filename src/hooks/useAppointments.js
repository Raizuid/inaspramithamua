import {useCallback,useEffect,useState} from 'react'
import {supabase} from '../services/supabase'
import {listAppointments} from '../services/appointments'
export function useAppointments(){const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''); const refresh=useCallback(async()=>{try{setLoading(true);setError('');setItems(await listAppointments())}catch(e){console.error(e);setError('Gagal memuat jadwal. Periksa koneksi internet dan coba lagi.')}finally{setLoading(false)}},[]); useEffect(()=>{refresh(); const ch=supabase.channel('appointments-live').on('postgres_changes',{event:'*',schema:'public',table:'appointments'},refresh).subscribe(); return()=>supabase.removeChannel(ch)},[refresh]); return {items,loading,error,refresh}}
