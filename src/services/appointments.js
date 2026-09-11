import { supabase } from './supabase'

export async function listAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', {
      ascending: true,
    })
    .order('appointment_time', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data || []
}

export async function createAppointment(values) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Sesi login tidak ditemukan.')
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...values,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateAppointment(id, values) {
  const { data, error } = await supabase
    .from('appointments')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteAppointment(id) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}