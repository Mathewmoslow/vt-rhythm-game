import React, { useEffect, useMemo, useRef, useState } from 'react';

const phases = {
  BRIEFING: 'briefing',
  ASSESSMENT: 'assessment',
  DECISION: 'decision',
  EXECUTION: 'execution',
  OUTCOME: 'outcome',
  DEBRIEF: 'debrief',
};

const quickSteps = [
  {
    step: '1',
    title: 'Check stability',
    body: 'Tap the patient markers first. The right branch should become obvious before the rhythm mechanic starts.',
  },
  {
    step: '2',
    title: 'Use the matrix',
    body: 'Unstable goes to synchronized cardioversion. Stable stays on the antiarrhythmic drug-treatment path.',
  },
  {
    step: '3',
    title: 'Stay on rhythm',
    body: 'Once you choose the branch, your timing and consistency decide whether the patient improves.',
  },
];

const treatmentMatrix = [
  {
    title: 'Unstable + pulse',
    route: 'Immediate synchronized cardioversion',
    detail: 'This is the urgent branch when instability markers are present.',
    tone: 'warm',
  },
  {
    title: 'Stable wide-complex',
    route: 'Antiarrhythmic drug-treatment path',
    detail: 'This build keeps the drug path high level and avoids real dosing instructions.',
    tone: 'cool',
  },
  {
    title: 'Still not improving',
    route: 'Reassess, escalate, and consult',
    detail: 'If the first pass fails, the lesson is escalation and support, not false certainty.',
    tone: 'neutral',
  },
];

const stabilityMeta = [
  {
    key: 'hypotension',
    label: 'Hypotension',
    description: 'Blood pressure drop',
    icon: 'BP',
  },
  {
    key: 'alteredMentalStatus',
    label: 'AMS',
    description: 'Altered mental status',
    icon: 'NEURO',
  },
  {
    key: 'shock',
    label: 'Shock',
    description: 'Signs of shock',
    icon: 'SHOCK',
  },
  {
    key: 'chestDiscomfort',
    label: 'Chest discomfort',
    description: 'Ischemic discomfort',
    icon: 'CHEST',
  },
  {
    key: 'acuteHeartFailure',
    label: 'Acute HF',
    description: 'Heart failure signs',
    icon: 'HF',
  },
];

const scenarios = [
  {
    id: 'unstable-vt-01',
    title: 'Episode 0',
    subtitle: 'The only rule that matters',
    rhythmLabel: 'Persistent wide-complex tachycardia',
    likelyRhythm: 'Likely monomorphic VT',
    bpm: 182,
    qrs: 'Wide',
    monomorphic: true,
    unstableFlags: {
      hypotension: true,
      alteredMentalStatus: true,
      shock: false,
      chestDiscomfort: false,
      acuteHeartFailure: false,
    },
    hint: 'Instability signs are present. Urgent synchronized cardioversion is the safer branch.',
    recommended: 'cardiovert',
    difficulty: 1,
    executionBpm: 94,
    beatCount: 8,
    syncWindows: [1, 3, 5, 7],
    copy: {
      summary:
        'The patient has a persistent tachyarrhythmia with clear instability markers. The game frames this as a medically informed fiction scenario based on clinician-facing emergency principles.',
      decisionWhy:
        'Instability changes the response path. The core lesson is not to shock everything. It is to match the intervention to rhythm plus patient status.',
      success:
        'The rhythm converts and perfusion improves. The team stabilized the patient by recognizing instability and delivering synchronized therapy with precise timing.',
      refractory:
        'The first attempt did not convert the rhythm. Escalation is needed, not panic. Reassess, increase energy, and continue coordinated care.',
      deteriorated:
        'The patient worsened toward arrest risk. In the fiction of the game, this is a failure state that signals delayed or poorly executed intervention, not a spectacle.',
    },
  },
  {
    id: 'stable-vt-02',
    title: 'Episode 1',
    subtitle: 'Controlled response under pressure',
    rhythmLabel: 'Stable wide-QRS tachycardia',
    likelyRhythm: 'Likely VT until proven otherwise',
    bpm: 166,
    qrs: 'Wide',
    monomorphic: true,
    unstableFlags: {
      hypotension: false,
      alteredMentalStatus: false,
      shock: false,
      chestDiscomfort: false,
      acuteHeartFailure: false,
    },
    hint: 'Stable presentation favors controlled antiarrhythmic management and monitoring in this prototype.',
    recommended: 'infuse',
    difficulty: 2,
    executionBpm: 116,
    beatCount: 12,
    syncWindows: [],
    copy: {
      summary:
        'The rhythm remains concerning, but the patient is not showing the instability signs used by the game decision layer. That shifts the focus toward controlled therapy rather than urgent synchronized cardioversion.',
      decisionWhy:
        'This prototype teaches the distinction between wide-complex tachycardia and unstable tachyarrhythmia. Stability is not permission to ignore the rhythm. It is a different branch.',
      success:
        'The infusion cadence stays controlled, the rhythm slows, and the patient remains perfusing. The score rewards steady execution rather than theatrical action.',
      refractory:
        'The rhythm remains persistent. The game prompts escalation and consultation rather than teaching one-step certainty.',
      deteriorated:
        'The patient develops worsening risk markers during delayed or erratic infusion control. Stability can change, which is one of the central lessons of the scenario.',
    },
  },
  {
    id: 'borderline-03',
    title: 'Episode 2',
    subtitle: 'Ambiguity without guesswork',
    rhythmLabel: 'Wide-complex tachycardia with noisy presentation',
    likelyRhythm: 'Probable VT with distracting artifact',
    bpm: 194,
    qrs: 'Wide',
    monomorphic: true,
    unstableFlags: {
      hypotension: true,
      alteredMentalStatus: false,
      shock: true,
      chestDiscomfort: true,
      acuteHeartFailure: false,
    },
    hint: 'Even with visual noise, the instability pattern is the real anchor for the decision.',
    recommended: 'cardiovert',
    difficulty: 3,
    executionBpm: 104,
    beatCount: 14,
    syncWindows: [2, 5, 8, 11, 13],
    copy: {
      summary:
        'The game introduces noise and distraction, but it keeps the truth table intact. The player should still win by reading instability correctly instead of chasing cosmetic signal complexity.',
      decisionWhy:
        'The challenge here is prioritization. The monitor is noisy, but the patient is telling you this is unstable.',
      success:
        'The team acts decisively and the encounter resolves. The reward comes from disciplined pattern recognition under pressure.',
      refractory:
        'The rhythm resists the first intervention. The debrief emphasizes escalation logic and reassessment rather than blame.',
      deteriorated:
        'The situation progressed toward a cardiac-arrest branch. The prototype treats this as a structured fail state with teaching value, not punishment theater.',
    },
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTimingTier(deltaMs) {
  const abs = Math.abs(deltaMs);
  if (abs <= 90) return 'Perfect';
  if (abs <= 170) return 'Great';
  if (abs <= 260) return 'Safe';
  return 'Miss';
}

function tierScore(tier) {
  if (tier === 'Perfect') return 100;
  if (tier === 'Great') return 75;
  if (tier === 'Safe') return 45;
  return 0;
}

function buildEcgPath(points = 80, amplitude = 1, noise = 0.08) {
  const values = [];
  for (let i = 0; i < points; i += 1) {
    const x = (i / (points - 1)) * 100;
    let y = 50;
    const beat = i % 16;
    if (beat === 3) y = 58;
    else if (beat === 4) y = 44;
    else if (beat === 5) y = 10;
    else if (beat === 6) y = 63;
    else if (beat === 7) y = 47;
    else y = 50 + Math.sin(i / 3.6) * 4 * amplitude;
    y += (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * noise * 10;
    values.push(`${x},${clamp(y, 4, 96)}`);
  }
  return values.join(' ');
}

function StatChip({ label, value }) {
  return (
    <div className="stat-chip">
      <div className="stat-chip-label">{label}</div>
      <div className="stat-chip-value">{value}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title">
      {eyebrow ? <div className="section-eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

function ActionButton({ variant, title, subtitle, description, onClick }) {
  return (
    <button type="button" className={`action-button action-button-${variant}`} onClick={onClick}>
      <div className="action-button-title">{title}</div>
      <div className="action-button-subtitle">{subtitle}</div>
      <p>{description}</p>
    </button>
  );
}

function MatrixCard({ title, route, detail, tone = 'neutral' }) {
  return (
    <div className={`matrix-card matrix-card-${tone}`}>
      <div className="mini-label">Treatment matrix</div>
      <h4>{title}</h4>
      <div className="matrix-route">{route}</div>
      <p>{detail}</p>
    </div>
  );
}

function StepCard({ step, title, body }) {
  return (
    <div className="step-card">
      <div className="step-card-number">{step}</div>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  );
}

export default function App() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState(phases.BRIEFING);
  const [revealedFlags, setRevealedFlags] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [consultUsed, setConsultUsed] = useState(false);
  const [encounterStress, setEncounterStress] = useState(32);
  const [beatIndex, setBeatIndex] = useState(0);
  const [beatProgress, setBeatProgress] = useState(0);
  const [lastDelta, setLastDelta] = useState(null);
  const [latestTier, setLatestTier] = useState(null);
  const [runComplete, setRunComplete] = useState(false);
  const executionStartRef = useRef(null);
  const animationFrameRef = useRef(0);

  const activeScenario = scenarios[scenarioIndex];
  const instabilityCount = useMemo(
    () => Object.values(activeScenario.unstableFlags).filter(Boolean).length,
    [activeScenario]
  );

  const recommendedText =
    activeScenario.recommended === 'cardiovert' ? 'SYNC CARDIOVERT' : 'DRUG TREATMENT PATH';
  const cycleMs = Math.round(60000 / activeScenario.executionBpm);
  const totalBeats = activeScenario.beatCount;
  const instabilityMeter = clamp(instabilityCount * 20 + encounterStress / 2, 0, 100);
  const accuracyPercent = attempts.length
    ? Math.round(
        (attempts.reduce((sum, item) => sum + tierScore(item.tier), 0) / (attempts.length * 100)) * 100
      )
    : 0;
  const ecgPath = buildEcgPath(90, activeScenario.difficulty * 0.75, activeScenario.difficulty * 0.08);

  useEffect(() => {
    if (phase !== phases.EXECUTION) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return undefined;
    }

    let cancelled = false;

    const loop = (timestamp) => {
      if (cancelled) return;
      if (executionStartRef.current === null) {
        executionStartRef.current = timestamp;
      }

      const elapsed = timestamp - executionStartRef.current;
      const currentBeat = Math.floor(elapsed / cycleMs);
      const progress = (elapsed % cycleMs) / cycleMs;

      setBeatIndex(Math.min(currentBeat, totalBeats - 1));
      setBeatProgress(progress);

      if (currentBeat >= totalBeats) {
        finalizeEncounter();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase, cycleMs, totalBeats, attempts, encounterStress, selectedAction, activeScenario]);

  function resetEncounter(nextScenarioIndex = scenarioIndex) {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setScenarioIndex(nextScenarioIndex);
    setPhase(phases.BRIEFING);
    setRevealedFlags([]);
    setSelectedAction(null);
    setOutcome(null);
    setAttempts([]);
    setCombo(0);
    setScore(0);
    setConsultUsed(false);
    setEncounterStress(32);
    setBeatIndex(0);
    setBeatProgress(0);
    setLastDelta(null);
    setLatestTier(null);
    setRunComplete(false);
    executionStartRef.current = null;
  }

  function assessFlag(flagKey) {
    if (revealedFlags.includes(flagKey)) return;
    setRevealedFlags((prev) => [...prev, flagKey]);
    const isPositive = activeScenario.unstableFlags[flagKey];
    setScore((prev) => prev + (isPositive ? 40 : 20));
    setEncounterStress((prev) => clamp(prev - 3, 0, 100));
    if (revealedFlags.length + 1 >= 3) {
      setPhase(phases.DECISION);
    }
  }

  function chooseAction(action) {
    setSelectedAction(action);
    setPhase(phases.EXECUTION);
    setEncounterStress((prev) => clamp(prev + (action === activeScenario.recommended ? -8 : 14), 0, 100));
    executionStartRef.current = null;
  }

  function triggerConsult() {
    if (consultUsed) return;
    setConsultUsed(true);
    setScore((prev) => Math.max(0, prev - 75));
  }

  function registerBeatHit() {
    if (phase !== phases.EXECUTION) return;
    if (executionStartRef.current === null) return;

    const now = performance.now();
    const elapsed = now - executionStartRef.current;
    const currentBeat = Math.floor(elapsed / cycleMs);
    if (currentBeat >= totalBeats) return;

    const beatCenter = currentBeat * cycleMs + cycleMs / 2;
    const deltaMs = elapsed - beatCenter;
    const tier = getTimingTier(deltaMs);
    const syncBeats = activeScenario.syncWindows || [];
    const beatMatters = selectedAction === 'cardiovert' ? syncBeats.includes(currentBeat) : true;
    const effectiveTier = beatMatters ? tier : 'Safe';

    setAttempts((prev) => [
      ...prev,
      {
        targetBeat: currentBeat + 1,
        deltaMs,
        tier: effectiveTier,
      },
    ]);
    setLatestTier(effectiveTier);
    setLastDelta(deltaMs);

    if (effectiveTier === 'Miss') {
      setCombo(0);
      setEncounterStress((prev) => clamp(prev + 8, 0, 100));
    } else {
      setCombo((prev) => prev + 1);
      setEncounterStress((prev) => clamp(prev - 4, 0, 100));
      setScore((prev) => prev + tierScore(effectiveTier));
    }
  }

  function finalizeEncounter() {
    const average = attempts.length
      ? attempts.reduce((sum, item) => sum + tierScore(item.tier), 0) / attempts.length
      : 0;

    const correctDecision = selectedAction === activeScenario.recommended;
    let nextOutcome;

    if (correctDecision && average >= 62 && encounterStress <= 68) {
      nextOutcome = 'converted';
      setScore((prev) => prev + 250);
    } else if (correctDecision && average >= 35) {
      nextOutcome = 'refractory';
      setScore((prev) => prev + 100);
    } else {
      nextOutcome = 'deteriorated';
    }

    setOutcome(nextOutcome);
    setPhase(phases.OUTCOME);
  }

  function proceedFromOutcome() {
    setPhase(phases.DEBRIEF);
    if (scenarioIndex === scenarios.length - 1) {
      setRunComplete(true);
    }
  }

  function nextScenario() {
    if (scenarioIndex < scenarios.length - 1) {
      resetEncounter(scenarioIndex + 1);
    } else {
      resetEncounter(0);
    }
  }

  const displayedOutcomeText =
    outcome === 'converted'
      ? activeScenario.copy.success
      : outcome === 'refractory'
        ? activeScenario.copy.refractory
        : activeScenario.copy.deteriorated;

  const decisionSummary =
    selectedAction === 'cardiovert'
      ? 'SYNC CARDIOVERT'
      : selectedAction === 'infuse'
        ? 'DRUG TREATMENT PATH'
        : 'None selected';

  const currentInstruction =
    phase === phases.BRIEFING
      ? 'Read the scenario, then start assessment.'
      : phase === phases.ASSESSMENT
        ? 'Check at least three markers before choosing a branch.'
        : phase === phases.DECISION
          ? 'Use the matrix. Unstable means cardioversion. Stable means drug treatment.'
          : phase === phases.EXECUTION
            ? 'Stay on tempo and carry out the branch you chose.'
            : phase === phases.OUTCOME
              ? 'Review the result and open the debrief.'
              : 'Read why the branch worked or failed, then move on.';

  return (
    <div className="page-shell">
      <div className="page-inner">
        <div className="hero-card fade-in">
          <div className="hero-topbar">
            <div>
              <div className="eyebrow">VT Response Prototype</div>
              <h1>Assess, choose, then execute</h1>
              <p className="hero-copy">
                This version is wired to be easier to read. The treatment matrix stays visible, the
                stable drug-treatment branch is explicit, and the copy is shorter so the player can tell
                what the app wants right away.
              </p>
            </div>
            <div className="badge-row">
              <span className="badge">Step 1: Check stability</span>
              <span className="badge">Step 2: Use the matrix</span>
              <span className="badge badge-warm">Step 3: Keep rhythm</span>
            </div>
          </div>

          <div className="main-grid">
            <div className="left-column">
              <section className="panel">
                <SectionTitle
                  eyebrow="Scenario"
                  title={`${activeScenario.title}: ${activeScenario.subtitle}`}
                  subtitle="Read the rhythm, check the patient, and choose the branch from the matrix instead of guessing."
                />
                <div className="stat-grid">
                  <StatChip label="Rhythm" value={activeScenario.rhythmLabel} />
                  <StatChip label="Likely class" value={activeScenario.likelyRhythm} />
                  <StatChip label="Rate" value={`${activeScenario.bpm} BPM`} />
                  <StatChip label="QRS" value={activeScenario.qrs} />
                </div>

                <div className="meter-block">
                  <div className="meter-row">
                    <span>Outcome meter</span>
                    <span>{instabilityMeter}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${instabilityMeter}%` }} />
                  </div>
                  <p className="helper-text">
                    Plain-language status indicator: Stable, Unstable, then Arrest risk.
                  </p>
                </div>

                <div className="ecg-panel">
                  <div className="panel-row-split">
                    <span>ECG trace and rhythm lane</span>
                    <span>Difficulty {activeScenario.difficulty} / 3</span>
                  </div>
                  <div className="ecg-canvas">
                    <svg viewBox="0 0 100 100" className="ecg-svg" aria-label="ECG trace">
                      <defs>
                        <linearGradient id="ecgGlow" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                          <stop offset="50%" stopColor="#67e8f9" stopOpacity="1" />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
                        </linearGradient>
                      </defs>
                      {[20, 40, 60, 80].map((line) => (
                        <line
                          key={`h-${line}`}
                          x1="0"
                          y1={line}
                          x2="100"
                          y2={line}
                          stroke="rgba(148,163,184,0.12)"
                          strokeWidth="0.4"
                        />
                      ))}
                      {[10, 30, 50, 70, 90].map((line) => (
                        <line
                          key={`v-${line}`}
                          x1={line}
                          y1="0"
                          x2={line}
                          y2="100"
                          stroke="rgba(148,163,184,0.08)"
                          strokeWidth="0.4"
                        />
                      ))}
                      <polyline
                        fill="none"
                        stroke="url(#ecgGlow)"
                        strokeWidth="1.8"
                        points={ecgPath}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {selectedAction === 'cardiovert' && phase === phases.EXECUTION
                        ? (activeScenario.syncWindows || []).map((windowBeat, index) => {
                            const x = ((windowBeat + 0.5) / totalBeats) * 100;
                            return (
                              <g key={`sync-${index}`}>
                                <line
                                  x1={x}
                                  y1="8"
                                  x2={x}
                                  y2="92"
                                  stroke="rgba(251,191,36,0.45)"
                                  strokeDasharray="1.5 1.8"
                                  strokeWidth="0.8"
                                />
                                <text
                                  x={x}
                                  y="12"
                                  textAnchor="middle"
                                  fill="rgba(251,191,36,0.9)"
                                  fontSize="4"
                                >
                                  SYNC
                                </text>
                              </g>
                            );
                          })
                        : null}
                      {phase === phases.EXECUTION ? (
                        <circle
                          cx={((beatIndex + beatProgress) / totalBeats) * 100}
                          cy="82"
                          r="3"
                          fill="#f8fafc"
                          className="pulse-dot"
                        />
                      ) : null}
                    </svg>
                  </div>
                </div>
              </section>

              <section className="panel">
                <SectionTitle
                  eyebrow="Assessment"
                  title="Check for instability"
                  subtitle="Tap three or more markers. The game then unlocks the branch decision."
                />
                <div className="stability-list">
                  {stabilityMeta.map((item) => {
                    const revealed = revealedFlags.includes(item.key);
                    const positive = activeScenario.unstableFlags[item.key];
                    const revealedClass = revealed ? (positive ? 'is-positive' : 'is-negative') : '';
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className={`stability-item ${revealedClass}`}
                        onClick={() => phase === phases.ASSESSMENT && assessFlag(item.key)}
                        disabled={phase !== phases.ASSESSMENT || revealed}
                      >
                        <div className="stability-left">
                          <div className="icon-box">{item.icon}</div>
                          <div>
                            <div className="stability-label">{item.label}</div>
                            <div className="stability-description">{item.description}</div>
                          </div>
                        </div>
                        <div className="stability-right">
                          <div className="mini-label">
                            {revealed ? 'Observed' : phase === phases.ASSESSMENT ? 'Check' : 'Locked'}
                          </div>
                          {revealed ? <div className="stability-state">{positive ? 'Present' : 'Not present'}</div> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="right-column">
              <div className="summary-grid">
                <div className="mini-panel">
                  <div className="mini-heading">What to do now</div>
                  <div className="mini-value capitalize">{phase}</div>
                  <p>{currentInstruction}</p>
                </div>
                <div className="mini-panel">
                  <div className="mini-heading">Score</div>
                  <div className="mini-value">{score}</div>
                  <p>Points reward checking the patient, choosing the right branch, and staying on tempo.</p>
                </div>
                <div className="mini-panel">
                  <div className="mini-heading">Timing quality</div>
                  <div className="mini-value">{accuracyPercent}%</div>
                  <p>Perfect, Great, Safe, and Miss keep the rhythm mechanic readable.</p>
                </div>
              </div>

              <section className="panel">
                <SectionTitle
                  eyebrow="Core loop"
                  title="What this screen is asking you to do"
                  subtitle="One loop, three steps, and one treatment matrix."
                />

                <div className="quick-steps-grid">
                  {quickSteps.map((item) => (
                    <StepCard key={item.step} {...item} />
                  ))}
                </div>

                {phase === phases.BRIEFING ? (
                  <div className="alert-box alert-info">
                    <h3>Scenario briefing</h3>
                    <p>{activeScenario.copy.summary}</p>
                    <div className="matrix-grid">
                      {treatmentMatrix.map((item) => (
                        <MatrixCard key={item.title} {...item} />
                      ))}
                    </div>
                    <div className="button-row">
                      <button type="button" className="primary-button" onClick={() => setPhase(phases.ASSESSMENT)}>
                        Start assessment
                      </button>
                      <button type="button" className="secondary-button" onClick={() => resetEncounter(scenarioIndex)}>
                        Reset scenario
                      </button>
                    </div>
                  </div>
                ) : null}

                {phase === phases.ASSESSMENT ? (
                  <div className="two-column-block">
                    <div className="sub-panel">
                      <h3>Assessment phase</h3>
                      <p>
                        Reveal at least three markers before committing. The branch should feel obvious after
                        a few checks, not buried under extra explanation.
                      </p>
                      <div className="stat-grid compact">
                        <StatChip label="Markers checked" value={`${revealedFlags.length} / 5`} />
                        <StatChip label="Likely branch" value={recommendedText} />
                      </div>
                    </div>
                    <div className="sub-panel">
                      <h3>Plain-language hint</h3>
                      <p>{activeScenario.hint}</p>
                      <button
                        type="button"
                        className="secondary-button block-button"
                        disabled={consultUsed}
                        onClick={triggerConsult}
                      >
                        {consultUsed ? 'Consult already used' : 'Use consult prompt (-75 score)'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {phase === phases.DECISION ? (
                  <div className="decision-stack">
                    <div className="matrix-grid">
                      {treatmentMatrix.map((item) => (
                        <MatrixCard key={item.title} {...item} />
                      ))}
                    </div>
                    <div className="decision-grid">
                      <ActionButton
                        variant="warm"
                        title="SYNC CARDIOVERT"
                        subtitle="Unstable path"
                        description="Pick this when instability markers are present. The timing windows matter most here."
                        onClick={() => chooseAction('cardiovert')}
                      />
                      <ActionButton
                        variant="cool"
                        title="DRUG TREATMENT PATH"
                        subtitle="Stable path"
                        description="Pick this for the stable branch. It uses antiarrhythmic treatment language without dosing detail."
                        onClick={() => chooseAction('infuse')}
                      />
                    </div>
                  </div>
                ) : null}

                {phase === phases.EXECUTION ? (
                  <div className="execution-stack">
                    <div className="execution-grid">
                      <div className="sub-panel">
                        <div className="execution-header">
                          <div>
                            <div className="mini-heading">Execution phase</div>
                            <div className="mini-value small">{decisionSummary}</div>
                          </div>
                          <div className="chip-row">
                            <StatChip label="Beat" value={`${Math.min(beatIndex + 1, totalBeats)} / ${totalBeats}`} />
                            <StatChip label="Combo" value={combo} />
                          </div>
                        </div>

                        <div className="timing-shell">
                          <div className="panel-row-split">
                            <span>Timing lane</span>
                            <span>{activeScenario.executionBpm} BPM</span>
                          </div>
                          <div className="timing-lane">
                            <div className="timing-center-line" />
                            <div className="timing-window" />
                            {Array.from({ length: totalBeats }).map((_, index) => {
                              const position = ((index - beatIndex) + (1 - beatProgress)) * 64 + 160;
                              const isSyncBeat = (activeScenario.syncWindows || []).includes(index);
                              return (
                                <div
                                  key={`beat-${index}`}
                                  className={`beat-pill ${isSyncBeat && selectedAction === 'cardiovert' ? 'beat-warm' : ''}`}
                                  style={{ left: `${position}px`, opacity: position > -20 && position < 340 ? 1 : 0.2 }}
                                />
                              );
                            })}
                          </div>
                          <button type="button" className="primary-button block-button" onClick={registerBeatHit}>
                            Tap on beat
                          </button>
                        </div>
                      </div>

                      <div className="sub-panel">
                        <h3>Live telemetry</h3>
                        <div className="meter-block compact-meter">
                          <div className="meter-row">
                            <span>Stress load</span>
                            <span>{encounterStress}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill warm-fill" style={{ width: `${encounterStress}%` }} />
                          </div>
                        </div>
                        <div className="stat-grid compact">
                          <StatChip label="Latest timing" value={latestTier || 'Waiting'} />
                          <StatChip label="Last offset" value={lastDelta === null ? '-' : `${Math.round(lastDelta)} ms`} />
                        </div>
                        <div className="note-box">
                          <div className="mini-heading">Execution note</div>
                          <p>
                            {selectedAction === 'cardiovert'
                              ? 'For synchronized cardioversion, the highlighted beats matter most. Missing them raises instability faster.'
                              : 'For the drug-treatment path, steady tempo across the full lane matters more than one perfect tap.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="attempt-grid">
                      {attempts.slice(-4).map((item, index) => (
                        <div key={`${item.targetBeat}-${index}`} className={`attempt-card tier-${item.tier.toLowerCase()}`}>
                          <div className="mini-label">Beat {item.targetBeat}</div>
                          <div className="attempt-title">{item.tier}</div>
                          <div className="attempt-offset">{Math.round(item.deltaMs)} ms</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {phase === phases.OUTCOME ? (
                  <div className={`alert-box outcome-box outcome-${outcome}`}>
                    <h3>Outcome: {outcome}</h3>
                    <p>{displayedOutcomeText}</p>
                    <div className="stat-grid compact">
                      <StatChip label="Decision made" value={decisionSummary} />
                      <StatChip label="Recommended" value={recommendedText} />
                      <StatChip label="Timing accuracy" value={`${accuracyPercent}%`} />
                    </div>
                    <div className="button-row">
                      <button type="button" className="primary-button" onClick={proceedFromOutcome}>
                        Open debrief
                      </button>
                    </div>
                  </div>
                ) : null}

                {phase === phases.DEBRIEF ? (
                  <div className="debrief-stack">
                    <div className="sub-panel">
                      <h3>Debrief</h3>
                      <p>{activeScenario.copy.decisionWhy}</p>
                      <div className="debrief-grid">
                        <div className="note-box">
                          <h4>What to remember</h4>
                          <ul>
                            <li>Assessment should precede action.</li>
                            <li>Instability is the main branch trigger.</li>
                            <li>Stable cases stay on the drug-treatment branch in this prototype.</li>
                            <li>Execution precision matters, but the branch decision matters first.</li>
                          </ul>
                        </div>
                        <div className="note-box">
                          <h4>What stays out of scope</h4>
                          <ul>
                            <li>No real-world dosing instruction.</li>
                            <li>No patient-specific treatment advice.</li>
                            <li>No glamorization of shocks or collapse.</li>
                            <li>No claim that the game replaces training or clinical guidance.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="button-row">
                      {!runComplete ? (
                        <button type="button" className="primary-button" onClick={nextScenario}>
                          {scenarioIndex < scenarios.length - 1 ? 'Next scenario' : 'Restart run'}
                        </button>
                      ) : null}
                      <button type="button" className="secondary-button" onClick={() => resetEncounter(scenarioIndex)}>
                        Replay scenario
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="panel three-up-panel">
                <SectionTitle
                  eyebrow="Decision matrix"
                  title="One matrix for the whole encounter"
                  subtitle="The treatment logic stays visible so the player is not guessing what the app wants."
                />
                <div className="matrix-grid">
                  {treatmentMatrix.map((item) => (
                    <MatrixCard key={item.title} {...item} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="bottom-grid">
          <section className="panel">
            <SectionTitle
              eyebrow="Quick guide"
              title="How to play this without overthinking it"
              subtitle="Treat it like a short checklist instead of a full dashboard."
            />
            <div className="two-column-block">
              <div className="note-box">
                <h4>During the run</h4>
                <ul>
                  <li>Check three markers.</li>
                  <li>Use the matrix to pick unstable or stable treatment.</li>
                  <li>Stay on tempo through the execution lane.</li>
                  <li>Read the debrief to see why the branch worked.</li>
                </ul>
              </div>
              <div className="note-box">
                <h4>Drug-treatment branch</h4>
                <ul>
                  <li>The stable branch now reads as a treatment choice, not a hidden alternate path.</li>
                  <li>It uses antiarrhythmic treatment language without real dosing instructions.</li>
                  <li>Escalation and consultation stay visible if the first pass fails.</li>
                  <li>The goal is clarity, not simulation depth.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="panel">
            <SectionTitle
              eyebrow="Guardrail copy"
              title="Safe framing"
              subtitle="The treatment matrix is educational framing only."
            />
            <div className="note-box">
              <p>
                For educational entertainment only. This prototype is a fictional, medically informed
                rhythm-game concept and is not a substitute for clinical training, emergency guidance, or
                patient-specific decision-making.
              </p>
              <p>In any real emergency, seek qualified medical help and follow local protocols.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
