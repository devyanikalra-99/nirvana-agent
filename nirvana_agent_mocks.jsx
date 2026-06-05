import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, XCircle, Activity, ArrowRight, Sparkles, ShieldCheck,
  Search, Layers, RefreshCw, ChevronRight, Zap, FileText, PhoneCall,
  MonitorSmartphone, Clock, CornerDownRight, Play, Plus
} from 'lucide-react';

/* ============================================================
   NIRVANA BRAND TOKENS  (matches oneverify_demo_prototype1)
   ============================================================ */
const C = {
  deepPurple: '#2F1D47',
  vibrantPurple: '#9273F4',
  lilac: '#AE9BEA',
  warmLight: '#DCD2C8',
  offWhite: '#F5F0EC',
  warmShadow: '#AD9D92',
  ink: '#1A0F2E',
  white: '#FFFFFF',
  green: '#3F8E5C',
  redAlert: '#B5374D',
  amber: '#C68B3C',
  cardBorder: '#E8DFD5',
};

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/* endpoint visual identity */
const EP = {
  '/v1/estimate':  { label: 'Coverage',  short: 'COV', color: C.deepPurple,    icon: ShieldCheck },
  '/v1/discover':  { label: 'Discovery', short: 'DSC', color: C.vibrantPurple, icon: Search },
  '/v1/scan':      { label: 'SCAN',      short: 'SCN', color: C.lilac,         icon: Layers },
  '/v1/medicaid':  { label: 'Medicaid',  short: 'MCD', color: '#6E59B8',       icon: ShieldCheck },
  '/v1/portal':    { label: 'Portal agent', short: 'RPA', color: C.amber,      icon: MonitorSmartphone },
};

function statusTone(code) {
  if (code >= 200 && code < 300) return { bg: `${C.green}14`, fg: C.green, line: C.green };
  if (code >= 400 && code < 500) return { bg: `${C.amber}1A`, fg: C.amber, line: C.amber };
  return { bg: `${C.redAlert}14`, fg: C.redAlert, line: C.redAlert };
}

/* ============================================================
   AGENT SCRIPT — the hero patient (Arnav's exact narrative)
   Cigna 404 -> drop member ID, Discovery -> Medicaid -> MCO
   ============================================================ */
const HERO_PATIENT = {
  name: 'Marcus Reyes', dob: '1989-03-14', zip: '07030', state: 'NJ',
  payerName: 'Cigna', payerId: '62308', memberId: 'U8841023B', npi: '1821547027',
};

const HERO_STEPS = [
  {
    kind: 'reason', icon: Sparkles,
    text: 'Standard check — payer and member ID both present. Starting on Coverage with the NPI optimized for Cigna.',
  },
  {
    kind: 'call', endpoint: '/v1/estimate', payer: 'Cigna · 62308', npi: '1356—optimized', code: 404, latency: 3120,
    text: 'Member not found at Cigna. The member ID looks mistyped, or the patient may have moved off this plan.',
  },
  {
    kind: 'reason', icon: RefreshCw,
    text: 'Dropping the member ID and running Insurance Discovery from name, DOB, and ZIP to locate any active commercial policy.',
  },
  {
    kind: 'call', endpoint: '/v1/discover', payer: 'Cigna · 62308', npi: '1356—optimized', code: 404, latency: 4015,
    text: 'No active commercial policy surfaced through Discovery.',
  },
  {
    kind: 'reason', icon: CornerDownRight,
    text: 'No commercial coverage found. Patient ZIP resolves to New Jersey — checking state Medicaid.',
  },
  {
    kind: 'call', endpoint: '/v1/medicaid', payer: 'NJ Medicaid · NJMCD', npi: 'input NPI', code: 200, plan: 'ACTIVE', latency: 3890,
    text: 'Active New Jersey Medicaid coverage confirmed for this patient.',
  },
  {
    kind: 'reason', icon: Search,
    text: 'Medicaid is active. Checking whether the patient is enrolled in a managed care organization, since that changes where claims should route.',
  },
  {
    kind: 'call', endpoint: '/v1/medicaid', payer: 'MCO lookup', npi: 'input NPI', code: 200, plan: 'ACTIVE', latency: 2240,
    text: 'Managed care organization identified: Molina Healthcare of New Jersey. Claims should be filed to Molina, not fee-for-service Medicaid.',
  },
];

const HERO_FINAL = {
  status: 'ACTIVE',
  recoveredVia: '/v1/medicaid',
  plan: 'Molina Healthcare of NJ (Medicaid MCO)',
  insuranceType: 'Managed Medicaid',
  memberObligation: '$0.00',
  flags: ['Recovered via Medicaid', 'MCO identified', 'Payer-on-file correction'],
  attempts: 4, latency: 13.3,
};

/* ============================================================
   ROOT
   ============================================================ */
const TABS = [
  { key: 'trace', label: 'Agent trace', sub: 'Single patient' },
  { key: 'batch', label: 'Batch — live', sub: 'Maximize Recovery on' },
  { key: 'escalate', label: 'Escalation', sub: 'Portal agent · V2' },
];

export default function App() {
  const [tab, setTab] = useState('trace');
  return (
    <div style={{ fontFamily: FONT, background: C.offWhite, minHeight: '100vh', color: C.deepPurple }}>
      <Header />
      <MockSwitcher tab={tab} setTab={setTab} />
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 32px 80px' }}>
        {tab === 'trace' && <AgentTraceScreen />}
        {tab === 'batch' && <BatchLiveScreen onOpenTrace={() => setTab('trace')} />}
        {tab === 'escalate' && <EscalateScreen />}
      </main>
    </div>
  );
}

/* ---------- Header ---------- */
function Header() {
  return (
    <header style={{
      background: C.offWhite, borderBottom: `1px solid ${C.cardBorder}`,
      padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
        <Logo />
        <nav style={{ display: 'flex', gap: 30, fontSize: 15, fontWeight: 500 }}>
          <span style={{ opacity: 0.5 }}>Checker</span>
          <span style={{ opacity: 0.5 }}>Reports</span>
          <span style={{ color: C.deepPurple, fontWeight: 700, borderBottom: `2px solid ${C.vibrantPurple}`, paddingBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={15} /> Nirvana Agent
          </span>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ background: C.warmLight, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>Testing SP</div>
        <div style={{ background: C.deepPurple, color: C.offWhite, width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>DK</div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="26" height="26" viewBox="0 0 28 28">
        <g transform="translate(14, 14)">
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <ellipse key={i} cx="0" cy="-7" rx="3" ry="6" fill={i % 2 === 0 ? C.vibrantPurple : C.warmShadow} transform={`rotate(${a})`} />
          ))}
          <circle cx="0" cy="0" r="2" fill={C.offWhite} />
        </g>
      </svg>
      <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.5 }}>nirvana</span>
    </div>
  );
}

/* ---------- Mock switcher (only for the mock deck, not a product element) ---------- */
function MockSwitcher({ tab, setTab }) {
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 32px 8px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: C.warmShadow, textTransform: 'uppercase', marginBottom: 10 }}>
        Mock deck · 3 screens
      </div>
      <div style={{ display: 'flex', gap: 8, background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 6, width: 'fit-content' }}>
        {TABS.map(t => {
          const active = t.key === tab;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              border: 'none', cursor: 'pointer', textAlign: 'left',
              background: active ? C.deepPurple : 'transparent',
              color: active ? C.offWhite : C.deepPurple,
              padding: '8px 16px', borderRadius: 10, transition: 'all .2s',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 11, opacity: active ? 0.75 : 0.5, marginTop: 1 }}>{t.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 1 — AGENT TRACE (single patient)
   ============================================================ */
function AgentTraceScreen() {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);
  const total = HERO_STEPS.length;

  const run = () => { setVisible(0); setDone(false); };

  useEffect(() => {
    if (visible >= total) { const t = setTimeout(() => setDone(true), 500); return () => clearTimeout(t); }
    const delay = visible === 0 ? 500 : (HERO_STEPS[visible - 1].kind === 'call' ? 1100 : 750);
    const t = setTimeout(() => setVisible(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Nirvana Agent</h1>
          <p style={{ fontSize: 14, color: C.warmShadow, margin: '6px 0 0' }}>
            The agent runs the recovery waterfall and logs every decision in plain language — the same trace OneVerify renders for any check.
          </p>
        </div>
        <button onClick={run} style={ghostBtn}><RefreshCw size={14} /> Replay</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22, marginTop: 22, alignItems: 'start' }}>
        {/* Patient card */}
        <div style={{ position: 'sticky', top: 16 }}>
          <PatientCard />
          {done && <OutcomeCard />}
        </div>

        {/* Reasoning stream */}
        <div style={{ background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: '8px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 14px', borderBottom: `1px solid ${C.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: C.deepPurple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={15} color={C.offWhite} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Agent reasoning</span>
            </div>
            {!done
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.vibrantPurple, fontSize: 13, fontWeight: 600 }}><Activity size={14} className="np-pulse" /> Working</span>
              : <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.green, fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={15} /> Resolved · {HERO_FINAL.latency}s</span>}
          </div>

          <div style={{ position: 'relative', paddingTop: 12 }}>
            {HERO_STEPS.slice(0, visible).map((s, i) => (
              <StepRow key={i} step={s} last={i === HERO_STEPS.length - 1} />
            ))}
            {visible < total && <ThinkingRow />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes npFade { from { opacity:0; transform: translateY(6px);} to {opacity:1; transform:none;} }
        @keyframes npPulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }
        @keyframes npDot { 0%,80%,100%{opacity:.25;} 40%{opacity:1;} }
        .np-pulse{ animation: npPulse 1.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function PatientCard() {
  const rows = [
    ['DOB', HERO_PATIENT.dob], ['State / ZIP', `${HERO_PATIENT.state} · ${HERO_PATIENT.zip}`],
    ['Payer on file', `${HERO_PATIENT.payerName} · ${HERO_PATIENT.payerId}`],
    ['Member ID', HERO_PATIENT.memberId], ['Provider NPI', HERO_PATIENT.npi],
  ];
  return (
    <div style={{ background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 21, background: C.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.deepPurple }}>MR</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{HERO_PATIENT.name}</div>
          <div style={{ fontSize: 12, color: C.warmShadow }}>Row 042 · Lumexa pilot</div>
        </div>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${C.offWhite}`, fontSize: 12.5 }}>
          <span style={{ color: C.warmShadow }}>{k}</span>
          <span style={{ fontFamily: MONO, fontSize: 12 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function StepRow({ step, last }) {
  const isCall = step.kind === 'call';
  const meta = isCall ? EP[step.endpoint] : null;
  const tone = isCall ? statusTone(step.code) : null;
  const Icon = isCall ? meta.icon : (step.icon || Sparkles);
  const nodeColor = isCall ? meta.color : C.warmShadow;

  return (
    <div style={{ display: 'flex', gap: 16, animation: 'npFade .4s ease-out' }}>
      {/* rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 34 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 17, flexShrink: 0,
          background: isCall ? meta.color : C.white,
          border: isCall ? 'none' : `1.5px dashed ${C.warmShadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={isCall ? C.white : C.warmShadow} />
        </div>
        {!last && <div style={{ width: 2, flex: 1, minHeight: 18, background: C.cardBorder, marginTop: 4 }} />}
      </div>

      {/* body */}
      <div style={{ flex: 1, paddingBottom: 20 }}>
        {isCall ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{meta.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.warmShadow }}>{step.endpoint}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: tone.bg, color: tone.fg, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                {step.code}{step.plan ? ` ${step.plan}` : ''}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: C.warmShadow, fontVariantNumeric: 'tabular-nums' }}>
                <Clock size={11} /> {(step.latency / 1000).toFixed(1)}s
              </span>
            </span>
          </div>
        ) : null}

        {isCall && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 7, fontSize: 11, color: C.warmShadow }}>
            <span>payer <span style={{ fontFamily: MONO, color: C.deepPurple }}>{step.payer}</span></span>
            <span>npi <span style={{ fontFamily: MONO, color: C.deepPurple }}>{step.npi}</span></span>
          </div>
        )}

        <div style={{
          fontSize: 13.5, lineHeight: 1.55,
          color: isCall ? C.deepPurple : C.deepPurple,
          background: isCall ? 'transparent' : `${C.vibrantPurple}0D`,
          borderLeft: isCall ? 'none' : `2px solid ${C.vibrantPurple}`,
          padding: isCall ? 0 : '8px 12px', borderRadius: isCall ? 0 : 8,
          fontStyle: isCall ? 'normal' : 'normal',
        }}>
          {step.text}
        </div>
      </div>
    </div>
  );
}

function ThinkingRow() {
  return (
    <div style={{ display: 'flex', gap: 16, animation: 'npFade .3s ease-out' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 34 }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: C.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={15} color={C.vibrantPurple} className="np-pulse" />
        </div>
      </div>
      <div style={{ flex: 1, paddingTop: 9, display: 'flex', gap: 5 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: C.vibrantPurple, animation: `npDot 1.2s ${i * 0.18}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function OutcomeCard() {
  const meta = EP[HERO_FINAL.recoveredVia];
  return (
    <div style={{ background: C.deepPurple, color: C.offWhite, borderRadius: 16, padding: 22, animation: 'npFade .5s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <CheckCircle2 size={20} color={C.green} />
        <span style={{ fontSize: 15, fontWeight: 700 }}>Active coverage recovered</span>
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }}>{HERO_FINAL.plan}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Mini k="Recovered via" v={meta.label} />
        <Mini k="Coverage type" v={HERO_FINAL.insuranceType} />
        <Mini k="Member owes" v={HERO_FINAL.memberObligation} />
        <Mini k="API calls" v={`${HERO_FINAL.attempts} · ${HERO_FINAL.latency}s`} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {HERO_FINAL.flags.map(f => (
          <span key={f} style={{ fontSize: 11, fontWeight: 600, background: `${C.lilac}33`, color: C.lilac, padding: '4px 10px', borderRadius: 20 }}>{f}</span>
        ))}
      </div>
    </div>
  );
}
function Mini({ k, v }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: C.lilac, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>{k}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
    </div>
  );
}

/* ============================================================
   SCREEN 2 — BATCH LIVE (Maximize Recovery toggle on)
   ============================================================ */
const FEED_LINES = [
  { row: 42, name: 'Marcus Reyes', ep: '/v1/medicaid', text: 'Cigna 404 → Discovery 404 → recovered active NJ Medicaid · Molina MCO', tone: 'good' },
  { row: 18, name: 'Patricia Gomez', ep: '/v1/estimate', text: 'Coverage active first pass · Aetna', tone: 'plain' },
  { row: 7, name: 'David Nguyen', ep: '/v1/scan', text: 'No member ID → Discovery 404 → recovered commercial coverage via SCAN', tone: 'good' },
  { row: 91, name: 'Karen Wright', ep: '/v1/estimate', text: '200 inactive → Medicaid + SCAN found no alternate · flagged for follow-up', tone: 'warn' },
  { row: 55, name: 'James Carter', ep: '/v1/discover', text: 'Member ID mismatch → corrected via Discovery · UnitedHealthcare', tone: 'good' },
  { row: 33, name: 'Linda Brooks', ep: '/v1/medicaid', text: 'Medicaid-first → active · Centene/Ambetter MCO identified', tone: 'good' },
  { row: 64, name: 'Robert Flores', ep: '/v1/estimate', text: 'Coverage active · secondary policy detected — coordinate benefits', tone: 'plain' },
  { row: 12, name: 'Susan Hill', ep: '/v1/scan', text: 'Cigna 502 upstream → retried + SCAN parallel → active', tone: 'good' },
];

function BatchLiveScreen({ onOpenTrace }) {
  const [done, setDone] = useState(120);
  const [feed, setFeed] = useState([]);
  const TOTAL = 750;
  const idxRef = useRef(0);

  useEffect(() => {
    const prog = setInterval(() => setDone(d => Math.min(d + Math.floor(8 + Math.random() * 22), TOTAL)), 420);
    const f = setInterval(() => {
      const line = FEED_LINES[idxRef.current % FEED_LINES.length];
      idxRef.current += 1;
      setFeed(prev => [{ ...line, id: Date.now() + Math.random() }, ...prev].slice(0, 9));
    }, 1100);
    return () => { clearInterval(prog); clearInterval(f); };
  }, []);

  const pct = (done / TOTAL) * 100;

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Lumexa pilot · 750 patients</h1>
          <p style={{ fontSize: 14, color: C.warmShadow, margin: '6px 0 0' }}>Every row runs the full recovery waterfall. The agent streams what it tried and why, live.</p>
        </div>
        <ToggleChip />
      </div>

      {/* progress */}
      <div style={{ background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 30, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{done}</span>
            <span style={{ fontSize: 16, color: C.warmShadow, marginLeft: 6 }}>/ {TOTAL} resolved</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.vibrantPurple, fontSize: 14, fontWeight: 600 }}>
            <Activity size={15} className="np-pulse" /> Agent running
          </span>
        </div>
        <div style={{ height: 8, background: C.offWhite, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${C.deepPurple}, ${C.vibrantPurple})`, transition: 'width .4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 18 }}>
          <Stat k="Recovered active" v={`${Math.round(done * 0.71)}`} tone={C.green} />
          <Stat k="Recovered via fallback" v={`${Math.round(done * 0.19)}`} tone={C.vibrantPurple} />
          <Stat k="MCOs identified" v={`${Math.round(done * 0.12)}`} tone={C.lilac} />
          <Stat k="Flagged for follow-up" v={`${Math.round(done * 0.07)}`} tone={C.amber} />
          <Stat k="Avg latency" v="11.4s" tone={C.deepPurple} />
        </div>
      </div>

      {/* feed + endpoint usage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        <div style={{ background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={15} color={C.vibrantPurple} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Agent activity</span>
            <span style={{ fontSize: 12, color: C.warmShadow, marginLeft: 'auto' }}>click a row to open its full trace</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {feed.map((f, i) => {
              const tcol = f.tone === 'good' ? C.green : f.tone === 'warn' ? C.amber : C.warmShadow;
              const meta = EP[f.ep];
              return (
                <button key={f.id} onClick={onOpenTrace} style={{
                  textAlign: 'left', cursor: 'pointer', width: '100%',
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  background: i === 0 ? `${C.vibrantPurple}0D` : C.offWhite,
                  border: `1px solid ${i === 0 ? C.vibrantPurple + '40' : 'transparent'}`,
                  borderRadius: 10, animation: i === 0 ? 'npFade .4s ease-out' : 'none',
                }}>
                  <span style={{ width: 4, height: 30, borderRadius: 2, background: tcol, flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.warmShadow, flexShrink: 0, width: 38 }}>#{f.row}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, flexShrink: 0, width: 120 }}>{f.name}</span>
                  <span style={{ fontSize: 12.5, color: C.deepPurple, flex: 1 }}>{f.text}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: meta.color, background: `${meta.color}14`, padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>{meta.short}</span>
                  <ChevronRight size={15} color={C.warmShadow} style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 22 }}>
          <span style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 16 }}>Where the agent found answers</span>
          {[['/v1/estimate', 0.58], ['/v1/discover', 0.16], ['/v1/medicaid', 0.17], ['/v1/scan', 0.09]].map(([ep, share]) => {
            const meta = EP[ep];
            return (
              <div key={ep} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{meta.label}</span>
                  <span style={{ color: C.warmShadow, fontVariantNumeric: 'tabular-nums' }}>{Math.round(done * share)}</span>
                </div>
                <div style={{ height: 7, background: C.offWhite, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${share * 100}%`, height: '100%', background: meta.color }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 18, padding: 14, background: C.offWhite, borderRadius: 10, fontSize: 12.5, color: C.deepPurple, lineHeight: 1.5 }}>
            <strong>42%</strong> of active results came from a fallback endpoint — coverage a single-API check would have missed.
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleChip() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: C.deepPurple, color: C.offWhite, padding: '11px 18px', borderRadius: 30 }}>
      <Sparkles size={16} color={C.lilac} />
      <span style={{ fontSize: 13.5, fontWeight: 600 }}>Maximize Recovery with Nirvana Agent</span>
      <span style={{ width: 38, height: 22, borderRadius: 11, background: C.vibrantPurple, position: 'relative', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 3, right: 3, width: 16, height: 16, borderRadius: 8, background: C.white }} />
      </span>
    </div>
  );
}
function Stat({ k, v, tone }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.warmShadow, marginBottom: 4, fontWeight: 500 }}>{k}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: tone, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>{v}</div>
    </div>
  );
}

/* ============================================================
   SCREEN 3 — ESCALATION (unresolved -> portal agent, V2)
   ============================================================ */
const ESC_PRIOR = [
  { endpoint: '/v1/estimate', code: 404, text: 'Coverage 404 — member not found at UnitedHealthcare.' },
  { endpoint: '/v1/discover', code: 404, text: 'Discovery found no alternate commercial policy.' },
  { endpoint: '/v1/medicaid', code: 404, text: 'No active Medicaid coverage in NY.' },
  { endpoint: '/v1/scan', code: 404, text: 'SCAN returned no match across supported payers.' },
];
const ESC_STEPS = [
  { kind: 'reason', icon: Zap, text: 'API waterfall exhausted without an active result. Escalating to a portal agent to confirm coverage directly from the payer portal.' },
  { kind: 'call', endpoint: '/v1/portal', payer: 'UnitedHealthcare · Availity', code: 102, text: 'Launching portal agent. Signing in to Availity and searching by name, DOB, and member ID.' },
  { kind: 'call', endpoint: '/v1/portal', payer: 'UnitedHealthcare · Availity', code: 102, text: 'Member located under a corrected ID — the digit order on file was transposed.' },
  { kind: 'call', endpoint: '/v1/portal', payer: 'UnitedHealthcare · Availity', code: 200, plan: 'ACTIVE', text: 'Active commercial coverage confirmed from the portal. Pulling benefit detail and writing the corrected member ID back to the record.' },
];

function EscalateScreen() {
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [vis, setVis] = useState(0);

  useEffect(() => {
    if (phase !== 'running') return;
    if (vis >= ESC_STEPS.length) { const t = setTimeout(() => setPhase('done'), 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setVis(v => v + 1), vis === 0 ? 500 : 1300);
    return () => clearTimeout(t);
  }, [phase, vis]);

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ marginBottom: 6 }}>
        <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Unresolved check · escalate</h1>
        <p style={{ fontSize: 14, color: C.warmShadow, margin: '6px 0 0' }}>
          When the API waterfall can't return an active result, the user can hand the check to a portal or phone agent. <span style={{ color: C.amber, fontWeight: 600 }}>V2 — pro tier.</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22, marginTop: 22, alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 16 }}>
          <div style={{ background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: C.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>JC</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>James Carter</div>
                <div style={{ fontSize: 12, color: C.warmShadow }}>Row 311 · UnitedHealthcare</div>
              </div>
            </div>
            <div style={{ background: `${C.amber}14`, border: `1px solid ${C.amber}40`, borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: C.deepPurple, display: 'flex', gap: 8 }}>
              <XCircle size={16} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>No active coverage after 4 API attempts.</span>
            </div>
          </div>

          {phase === 'idle' && (
            <button onClick={() => setPhase('running')} style={{
              width: '100%', background: C.deepPurple, color: C.offWhite, border: 'none',
              padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}>
              <Sparkles size={16} color={C.lilac} /> Trigger Nirvana Agent to maximize recovery
            </button>
          )}
          {phase === 'done' && (
            <div style={{ background: C.deepPurple, color: C.offWhite, borderRadius: 16, padding: 20, animation: 'npFade .5s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                <CheckCircle2 size={18} color={C.green} /><span style={{ fontWeight: 700, fontSize: 14 }}>Recovered via portal agent</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>Active UnitedHealthcare coverage confirmed. Corrected member ID written back to the record.</div>
            </div>
          )}
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: '8px 26px 26px' }}>
          <div style={{ padding: '18px 0 14px', borderBottom: `1px solid ${C.cardBorder}`, fontSize: 13, fontWeight: 600, color: C.warmShadow, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            API waterfall · already attempted
          </div>
          <div style={{ paddingTop: 14 }}>
            {ESC_PRIOR.map((s, i) => {
              const meta = EP[s.endpoint]; const tone = statusTone(s.code);
              return (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '8px 0', opacity: 0.7 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 13, background: `${meta.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: meta.color, flexShrink: 0 }}>{meta.short}</span>
                  <span style={{ fontSize: 13, flex: 1, color: C.deepPurple }}>{s.text}</span>
                  <span style={{ background: tone.bg, color: tone.fg, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{s.code}</span>
                </div>
              );
            })}
          </div>

          {phase !== 'idle' && (
            <>
              <div style={{ margin: '18px 0 14px', padding: '8px 0', borderTop: `1px dashed ${C.warmShadow}`, fontSize: 13, fontWeight: 600, color: C.amber, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MonitorSmartphone size={15} /> Portal agent escalation
              </div>
              {ESC_STEPS.slice(0, vis).map((s, i) => <StepRow key={i} step={s} last={i === ESC_STEPS.length - 1 && phase === 'done'} />)}
              {phase === 'running' && vis < ESC_STEPS.length && <ThinkingRow />}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes npFade { from { opacity:0; transform: translateY(6px);} to {opacity:1; transform:none;} }
        @keyframes npPulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }
        @keyframes npDot { 0%,80%,100%{opacity:.25;} 40%{opacity:1;} }
        .np-pulse{ animation: npPulse 1.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

/* ---------- shared ---------- */
const ghostBtn = {
  background: C.white, color: C.deepPurple, border: `1px solid ${C.cardBorder}`,
  padding: '9px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 7,
};
