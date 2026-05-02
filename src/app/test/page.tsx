'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestPage() {
  const [status, setStatus] = useState<Record<string, any>>({})
  const [realtimeEvents, setRealtimeEvents] = useState<string[]>([])
  const [running, setRunning] = useState(true)

  useEffect(() => {
    async function runTests() {
      const results: Record<string, any> = {}

      // ═══════════ SECTION 1: CONNECTION ═══════════
      
      // Test 1: Basic connection
      try {
        const { error } = await supabase.from('profiles').select('count')
        results.connection = error ? `❌ ${error.message}` : '✅ Connected'
      } catch (e: any) {
        results.connection = `❌ ${e.message}`
      }

      // Test 2: Auth session
      try {
        const { data: { session } } = await supabase.auth.getSession()
        results.auth_session = session 
          ? `✅ Logged in as ${session.user.email}` 
          : '⚠️ Not logged in (expected if testing fresh)'
      } catch (e: any) {
        results.auth_session = `❌ ${e.message}`
      }

      // Test 3: Each table
      const tables = [
        'profiles', 'listings', 'drivers', 'delivery_assignments',
        'complaints', 'valorization_partners', 'valorization_logs',
        'csr_subscriptions', 'impact_reports', 'valorization_invoices',
        'donors', 'receivers'
      ]
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1)
          results[`table_${table}`] = error 
            ? `❌ ${error.message}` 
            : `✅ exists (${data?.length ?? 0} rows visible)`
        } catch (e: any) {
          results[`table_${table}`] = `❌ ${e.message}`
        }
      }

      // ═══════════ SECTION 2: AUTH ═══════════
      
      // Test: Signup
      try {
        const testEmail = `test_${Date.now()}@test.com`
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: 'TestPass123!',
          options: { data: { full_name: 'Test User', role: 'donor' } }
        })
        
        if (signUpError) {
          results.signup = `❌ ${signUpError.message}`
        } else if (signUpData?.user && !signUpData.session) {
          results.signup = `⚠️ Signup works but EMAIL CONFIRMATION IS ON — user created but no session. DISABLE email confirmation in Supabase Dashboard → Authentication → Providers → Email → "Confirm email" toggle OFF`
        } else if (signUpData?.session) {
          results.signup = `✅ Signup works + auto-confirmed (session created)`
        } else {
          results.signup = `⚠️ Signup returned unexpected data`
        }

        // Test: Profile trigger
        if (signUpData?.user) {
          await new Promise(r => setTimeout(r, 2000)) // wait for trigger
          const { data: profile, error: profileError } = await supabase
            .from('profiles').select('*').eq('id', signUpData.user.id).single()
          results.profile_trigger = profileError 
            ? `❌ Profile NOT auto-created: ${profileError.message}. Run the auth SQL setup in Supabase SQL Editor.`
            : `✅ Profile auto-created with role: ${profile?.role}`
        }
      } catch (e: any) {
        results.signup = `❌ ${e.message}`
      }

      // Test: Realtime
      try {
        const channel = supabase.channel('test-connection')
        await new Promise((resolve) => {
          channel.subscribe((status) => {
            results.realtime = status === 'SUBSCRIBED' 
              ? '✅ Realtime connected' 
              : `❌ Status: ${status}`
            resolve(null)
          })
          setTimeout(() => {
            results.realtime = results.realtime || '❌ Timeout — realtime failed'
            resolve(null)
          }, 5000)
        })
        supabase.removeChannel(channel)
      } catch (e: any) {
        results.realtime = `❌ ${e.message}`
      }

      // ═══════════ SECTION 5: MATCHING API ═══════════
      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: 'test-nonexistent' })
        })
        const data = await res.json()
        results.matching_api = res.status === 404 
          ? '✅ Match API exists (returned 404 for test ID — expected)'
          : res.ok 
            ? `✅ Match API works: ${JSON.stringify(data).slice(0,80)}`
            : `❌ Match API error: ${data.error || res.status}`
      } catch (e: any) {
        results.matching_api = `❌ Match API unreachable: ${e.message}`
      }

      // ═══════════ SECTION 7: VALORIZE API ═══════════
      try {
        const res = await fetch('/api/valorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: 'test-nonexistent' })
        })
        const data = await res.json()
        results.valorize_api = res.status === 404 
          ? '✅ Valorize API exists (returned 404 for test ID — expected)'
          : res.ok 
            ? `✅ Valorize API works`
            : `❌ Valorize API error: ${data.error || res.status}`
      } catch (e: any) {
        results.valorize_api = `❌ Valorize API unreachable: ${e.message}`
      }

      setStatus(results)
      setRunning(false)
    }
    runTests()
  }, [])

  // Realtime subscription test
  useEffect(() => {
    const channel = supabase
      .channel(`test-realtime-${Date.now()}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'listings' },
        (payload) => {
          setRealtimeEvents(prev => [
            `✅ ${new Date().toLocaleTimeString()} — ${payload.eventType} on listings`,
            ...prev
          ])
        }
      )
      .subscribe((status) => {
        setRealtimeEvents(prev => [`[${new Date().toLocaleTimeString()}] Subscription: ${status}`, ...prev])
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', background: '#0a0a0a', 
                  color: '#e3e2e3', minHeight: '100vh', fontSize: 13 }}>
      <h1 style={{ color: '#10b981', marginBottom: 4 }}>🔬 FoodFlow System Diagnostics</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        {running ? '⏳ Running tests...' : `✅ Tests complete — ${new Date().toLocaleTimeString()}`}
      </p>
      
      <div style={{ display: 'grid', gap: 8 }}>
        {Object.entries(status).map(([key, val]) => (
          <div key={key} style={{ 
            padding: '8px 12px', 
            background: val.startsWith('✅') ? '#10b98110' : val.startsWith('⚠️') ? '#f59e0b10' : '#ef444410',
            border: `1px solid ${val.startsWith('✅') ? '#10b98130' : val.startsWith('⚠️') ? '#f59e0b30' : '#ef444430'}`,
            borderRadius: 8 
          }}>
            <span style={{ color: '#999' }}>{key.replace(/_/g, ' ').toUpperCase()}: </span>
            <span>{val}</span>
          </div>
        ))}
      </div>

      <h2 style={{ color: '#10b981', marginTop: 32, marginBottom: 8 }}>📡 Realtime Events (live)</h2>
      <p style={{ color: '#666', marginBottom: 8 }}>Insert/update a listing in Supabase to test</p>
      <div style={{ background: '#111', padding: 16, borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>
        {realtimeEvents.length === 0 
          ? <span style={{ color: '#555' }}>Waiting for events...</span>
          : realtimeEvents.map((e, i) => <div key={i} style={{ marginBottom: 4 }}>{e}</div>)}
      </div>
    </div>
  )
}
