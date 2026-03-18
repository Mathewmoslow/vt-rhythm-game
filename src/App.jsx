import React, { useEffect, useMemo, useRef, useState } from 'react';

const phases = {
  INTRO: 'intro',
  CHOICE: 'choice',
  TIMING: 'timing',
  RESULT: 'result',
};

const signMeta = {
  hypotension: 'Hypotension',
  alteredMentalStatus: 'Altered mental status',
  shock: 'Shock',
  chestDiscomfort: 'Chest discomfort',
  acuteHeartFailure: 'Acute heart failure',
};

const scenarios = [
  {
    id: 'unstable-vt-01',
    title: 'Round 1',
    subtitle: 'Unstable with a pulse',
    rhythmLabel: 'Persistent wide-complex tachycardia',
    likelyRhythm: 'Likely monomorphic VT',
    bpm: 182,
    qrs: 'Wide',
    unstableFlags: {
      hypotension: true,
      alteredMentalStatus: true,
      shock: false,
      chestDiscomfort: false,
      acuteHeartFailure: false,
    },
    recommended: 'cardiovert',
    hint: 'Instability is present, so this is the urgent synchronized cardioversion branch.',
    executionBpm: 94,
    beatCount: 8,
    syncWindows: [1, 3, 5, 7],
    copy: {
      summary: 'The patient has a wide-complex tachycardia and is not stable.',
      why: 'When instability is present, the study point is to recognize the urgent branch quickly.',
      success: 'You recognized the unstable branch and executed it cleanly.',
      failure: 'The rhythm branch was missed or the timing was too erratic. Unstable cases need fast recognition.',
    },
  },
  {
    id: 'stable-vt-02',
    title: 'Round 2',
    subtitle: 'Stable but still dangerous',
    rhythmLabel: 'Stable wide-QRS tachycardia',
    likelyRhythm: 'Likely VT until proven otherwise',
    bpm: 166,
    qrs: 'Wide',
    unstableFlags: {
      hypotension: false,
      alteredMentalStatus: false,
      shock: false,
      chestDiscomfort: false,
      acuteHeartFailure: false,
    },
    recommended: 'infuse',
    hint: 'No instability signs are showing, so this stays on the antiarrhythmic drug-treatment path.',
    executionBpm: 116,
    beatCount: 10,
    syncWindows: [],
    copy: {
      summary: 'The rhythm is serious, but the patient is stable right now.',
      why: 'Stable wide-complex tachycardia is not the same branch as unstable tachycardia.',
      success: 'You stayed on the stable treatment branch and kept control through the rhythm round.',
      failure: 'The key miss here is treating a stable case like an unstable one or losing rhythm control.',
    },
  },
  {
    id: 'borderline-03',
    title: 'Round 3',
    subtitle: 'Noisy monitor, unstable patient',
    rhythmLabel: 'Wide-complex tachycardia with artifact',
    likelyRhythm: 'Probable VT',
    bpm: 194,
    qrs: 'Wide',
    unstableFlags: {
      hypotension: true,
      alteredMentalStatus: false,
      shock: true,
      chestDiscomfort: true,
      acuteHeartFailure: false,
    },
    recommended: 'cardiovert',
    hint: 'Ignore the noisy monitor. The patient still looks unstable.',
    executionBpm: 104,
    beatCount: 12,
    syncWindows: [2, 5, 8, 10],
    copy: {
      summary: 'The strip is messy, but the patient clues still point to the unstable branch.',
      why: 'The study point is to anchor on patient status instead of getting lost in signal noise.',
      success: 'You focused on the patient, chose the right branch, and stayed on beat.',
      failure: 'The patient clues pointed to instability, but the branch or timing did not hold together.',
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

function StatPill({ label, value }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function App() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState(phases.INTRO);
  const [selectedAction, setSelectedAction] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [beatIndex, setBeatIndex] = useState(0);
  const [beatProgress, setBeatProgress] = useState(0);
  const [latestTier, setLatestTier] = useState(null);
  const [roundScore, setRoundScore] = useState(0);
  const [studyScore, setStudyScore] = useState(0);
  const [result, setResult] = useState(null);
  const [runComplete, setRunComplete] = useState(false);
  const executionStartRef = useRef(null);
  const animationFrameRef = useRef(0);

  const activeScenario = scenarios[scenarioIndex];
  const cycleMs = Math.round(60000 / activeScenario.executionBpm);
  const totalBeats = activeScenario.beatCount;
  const ecgPath = buildEcgPath(90, 1 + scenarioIndex * 0.12, 0.1 + scenarioIndex * 0.04);

  const presentSigns = useMemo(
    () =>
      Object.entries(activeScenario.unstableFlags)
        .filter(([, value]) => value)
        .map(([key]) => signMeta[key]),
    [activeScenario]
  );

  const accuracy = attempts.length
    ? Math.round(
        (attempts.reduce((sum, item) => sum + tierScore(item.tier), 0) / (attempts.length * 100)) * 100
      )
    : 0;

  useEffect(() => {
    if (phase !== phases.TIMING) {
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
        finishRound();
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
  }, [phase, cycleMs, totalBeats]);

  function resetRound(nextIndex = scenarioIndex) {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setScenarioIndex(nextIndex);
    setPhase(phases.INTRO);
    setSelectedAction(null);
    setAttempts([]);
    setBeatIndex(0);
    setBeatProgress(0);
    setLatestTier(null);
    setRoundScore(0);
    setResult(null);
    setRunComplete(false);
    executionStartRef.current = null;
  }

  function startChoice() {
    setPhase(phases.CHOICE);
  }

  function chooseAction(action) {
    setSelectedAction(action);
    setAttempts([]);
    setBeatIndex(0);
    setBeatProgress(0);
    setLatestTier(null);
    setRoundScore(action === activeScenario.recommended ? 150 : 0);
    executionStartRef.current = null;
    setPhase(phases.TIMING);
  }

  function registerBeatHit() {
    if (phase !== phases.TIMING || executionStartRef.current === null) return;

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

    setAttempts((prev) => [...prev, { targetBeat: currentBeat + 1, tier: effectiveTier }]);
    setLatestTier(effectiveTier);
    setRoundScore((prev) => prev + tierScore(effectiveTier));
  }

  function finishRound() {
    const correctChoice = selectedAction === activeScenario.recommended;
    const passedTiming = accuracy >= 45;
    const passed = correctChoice && passedTiming;

    const nextResult = {
      passed,
      correctChoice,
      passedTiming,
      recommended:
        activeScenario.recommended === 'cardiovert' ? 'SYNC CARDIOVERT' : 'DRUG TREATMENT PATH',
      explanation: activeScenario.copy.why,
      summary: passed ? activeScenario.copy.success : activeScenario.copy.failure,
    };

    setResult(nextResult);
    setStudyScore((prev) => prev + roundScore);
    setPhase(phases.RESULT);
  }

  function nextRound() {
    if (scenarioIndex < scenarios.length - 1) {
      resetRound(scenarioIndex + 1);
      return;
    }
    setRunComplete(true);
    resetRound(0);
  }

  const progressLabel =
    phase === phases.INTRO
      ? 'Read case'
      : phase === phases.CHOICE
        ? 'Pick path'
        : phase === phases.TIMING
          ? 'Play round'
          : 'See result';

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="topbar">
          <div>
            <div className="eyebrow">VT Study Game</div>
            <h1>One case. One choice. One quick rhythm round.</h1>
            <p className="intro-copy">
              This is a study game, not a dashboard. Read the case, pick the treatment path, play the beat round,
              then get the takeaway.
            </p>
          </div>
          <div className="score-stack">
            <StatPill label="Round" value={`${scenarioIndex + 1}/${scenarios.length}`} />
            <StatPill label="Step" value={progressLabel} />
            <StatPill label="Study score" value={studyScore + roundScore} />
          </div>
        </header>

        <main className="game-card">
          <section className="case-panel">
            <div className="case-head">
              <div>
                <div className="eyebrow">{activeScenario.title}</div>
                <h2>{activeScenario.subtitle}</h2>
              </div>
              <div className="tag">{activeScenario.rhythmLabel}</div>
            </div>

            <div className="stats-row">
              <StatPill label="Likely rhythm" value={activeScenario.likelyRhythm} />
              <StatPill label="Rate" value={`${activeScenario.bpm} BPM`} />
              <StatPill label="QRS" value={activeScenario.qrs} />
            </div>

            <div className="trace-card">
              <svg viewBox="0 0 100 100" className="ecg-svg" aria-label="ECG trace">
                <polyline
                  fill="none"
                  stroke="url(#ecgGlow)"
                  strokeWidth="1.8"
                  points={ecgPath}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="ecgGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#fde68a" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="clue-panel">
              <div className="eyebrow">Patient clues</div>
              <ul className="clue-list">
                {presentSigns.length ? (
                  presentSigns.map((sign) => <li key={sign}>{sign}</li>)
                ) : (
                  <li>No instability signs are currently present.</li>
                )}
              </ul>
            </div>
          </section>

          {phase === phases.INTRO ? (
            <section className="play-panel">
              <div className="phase-card">
                <div className="eyebrow">Step 1</div>
                <h3>Read the case</h3>
                <p>{activeScenario.copy.summary}</p>
                <p className="helper-copy">{activeScenario.hint}</p>
                <button type="button" className="primary-button" onClick={startChoice}>
                  Start round
                </button>
              </div>
            </section>
          ) : null}

          {phase === phases.CHOICE ? (
            <section className="play-panel">
              <div className="phase-card">
                <div className="eyebrow">Step 2</div>
                <h3>Which path fits this case?</h3>
                <p>Pick the branch first. The rhythm round comes after the choice.</p>
                <div className="choice-grid">
                  <button type="button" className="choice-button danger" onClick={() => chooseAction('cardiovert')}>
                    <span>SYNC CARDIOVERT</span>
                    <small>Use for unstable tachycardia with a pulse.</small>
                  </button>
                  <button type="button" className="choice-button calm" onClick={() => chooseAction('infuse')}>
                    <span>DRUG TREATMENT PATH</span>
                    <small>Use for stable wide-complex tachycardia.</small>
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {phase === phases.TIMING ? (
            <section className="play-panel">
              <div className="phase-card">
                <div className="eyebrow">Step 3</div>
                <h3>Play the rhythm round</h3>
                <p>
                  {selectedAction === 'cardiovert'
                    ? 'Tap in time when the highlighted sync beats reach center.'
                    : 'Tap steadily in time. This round is about keeping a stable treatment rhythm.'}
                </p>

                <div className="lane-shell">
                  <div className="lane-head">
                    <span>Beat {Math.min(beatIndex + 1, totalBeats)} / {totalBeats}</span>
                    <span>{activeScenario.executionBpm} BPM</span>
                  </div>
                  <div className="timing-lane">
                    <div className="center-line" />
                    <div className="timing-window" />
                    {Array.from({ length: totalBeats }).map((_, index) => {
                      const position = ((index - beatIndex) + (1 - beatProgress)) * 64 + 160;
                      const isSyncBeat = (activeScenario.syncWindows || []).includes(index);
                      return (
                        <div
                          key={`beat-${index}`}
                          className={`beat-dot ${isSyncBeat && selectedAction === 'cardiovert' ? 'sync-beat' : ''}`}
                          style={{ left: `${position}px`, opacity: position > -20 && position < 340 ? 1 : 0.18 }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="timing-feedback">
                  <StatPill label="Latest" value={latestTier || 'Waiting'} />
                  <StatPill label="Accuracy" value={`${accuracy}%`} />
                  <StatPill label="Round score" value={roundScore} />
                </div>

                <button type="button" className="primary-button pulse-button" onClick={registerBeatHit}>
                  Tap on beat
                </button>
              </div>
            </section>
          ) : null}

          {phase === phases.RESULT && result ? (
            <section className="play-panel">
              <div className={`phase-card result-card ${result.passed ? 'success' : 'failure'}`}>
                <div className="eyebrow">Result</div>
                <h3>{result.passed ? 'Correct branch' : 'Study this one again'}</h3>
                <p>{result.summary}</p>

                <div className="result-grid">
                  <StatPill label="Best answer" value={result.recommended} />
                  <StatPill label="Your choice" value={selectedAction === 'cardiovert' ? 'SYNC CARDIOVERT' : 'DRUG TREATMENT PATH'} />
                  <StatPill label="Timing accuracy" value={`${accuracy}%`} />
                </div>

                <div className="takeaway-box">
                  <div className="eyebrow">Takeaway</div>
                  <p>{result.explanation}</p>
                </div>

                <button type="button" className="primary-button" onClick={nextRound}>
                  {scenarioIndex < scenarios.length - 1 ? 'Next round' : 'Restart run'}
                </button>
              </div>
            </section>
          ) : null}
        </main>

        <footer className="footer-note">
          <p>Educational game only. This is not clinical guidance or patient-specific treatment advice.</p>
          {runComplete ? <p>You finished the run. Restarting sends you back to Round 1.</p> : null}
        </footer>
      </div>
    </div>
  );
}
