import React, { useMemo, useState } from 'react';

const cases = [
  {
    id: 'stable-vt',
    title: 'Case 1',
    rhythm: 'Regular monomorphic wide-complex tachycardia',
    presentation: 'Palpitations and dizziness during evaluation',
    bpm: 166,
    pulse: 'Palpable radial pulse',
    hemodynamics: 'Blood pressure 118/74, awake, speaking clearly',
    clues: ['Complains of palpitations', 'Skin warm', 'No chest pain reported', 'No respiratory distress'],
    question: 'What is the best immediate treatment path?',
    options: [
      'Synchronized cardioversion',
      'CPR and defibrillation',
      'Antiarrhythmic infusion (eg amiodarone)',
      'Epinephrine ASAP',
    ],
    answer: 2,
    why: 'Stable wide-QRS tachycardia goes down the antiarrhythmic-infusion path. This is not the CPR/defibrillation branch because there is still a pulse.',
    ecg: '16,52 24,50 28,48 32,46 36,22 40,70 44,40 48,52 52,50 56,48 60,24 64,72 68,42 72,52 76,50 80,48',
  },
  {
    id: 'unstable-vt',
    title: 'Case 2',
    rhythm: 'Regular monomorphic wide-complex tachycardia',
    presentation: 'Sudden deterioration during monitor check',
    bpm: 184,
    pulse: 'Carotid pulse present',
    hemodynamics: 'Blood pressure 76/40, confused, pale',
    clues: ['Diaphoretic', 'Hard to answer questions', 'Weak peripheral perfusion', 'Not in cardiac arrest'],
    question: 'What is the best immediate treatment path?',
    options: [
      'Synchronized cardioversion',
      'CPR and defibrillation',
      'Antiarrhythmic infusion (eg amiodarone)',
      'Epinephrine ASAP',
    ],
    answer: 0,
    why: 'When tachycardia with a pulse is causing hypotension, altered mental status, shock, ischemic chest discomfort, or acute heart failure, the immediate branch is synchronized cardioversion.',
    ecg: '14,54 22,50 26,46 30,18 34,74 38,42 42,54 46,50 50,46 54,20 58,74 62,42 66,54 70,50 74,46 78,18 82,74 86,42',
  },
  {
    id: 'pulseless-vt',
    title: 'Case 3',
    rhythm: 'Very rapid wide-complex rhythm',
    presentation: 'Collapsed patient on the floor',
    bpm: 'Very fast',
    pulse: 'No palpable pulse',
    hemodynamics: 'Unresponsive and apneic',
    clues: ['Monitor shows a chaotic rapid ventricular rhythm', 'Patient does not respond', 'No normal perfusion signs'],
    question: 'What is the best immediate next step?',
    options: [
      'Synchronized cardioversion',
      'CPR and defibrillation',
      'Amiodarone first',
      'Epinephrine first',
    ],
    answer: 1,
    why: 'Pulseless VT/VF is a shockable cardiac-arrest rhythm. Start high-quality CPR and defibrillate. Epinephrine and amiodarone come later in the arrest algorithm, not before the first shock/CPR cycle.',
    ecg: '12,60 18,28 24,78 30,26 36,76 42,24 48,78 54,26 60,76 66,24 72,78 78,26 84,76',
  },
  {
    id: 'pea',
    title: 'Case 4',
    rhythm: 'Organized slow electrical rhythm',
    presentation: 'Unresponsive patient with monitor activity',
    bpm: 48,
    pulse: 'No palpable pulse',
    hemodynamics: 'Unresponsive and not breathing normally',
    clues: ['Monitor shows organized complexes', 'No signs of circulation', 'Rhythm is not chaotic or fibrillating'],
    question: 'What is the best immediate next step?',
    options: [
      'Shock now',
      'CPR and epinephrine',
      'Amiodarone',
      'Synchronized cardioversion',
    ],
    answer: 1,
    why: 'PEA is not a shockable rhythm. The immediate branch is high-quality CPR plus epinephrine as soon as possible, while you search for reversible causes.',
    ecg: '14,58 20,56 26,58 32,54 38,56 44,58 50,56 56,58 62,54 68,56 74,58 80,56 86,58',
  },
];

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default function App() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const activeCase = cases[caseIndex];
  const correct = selectedIndex === activeCase.answer;
  const progress = `${caseIndex + 1} / ${cases.length}`;

  const heading = useMemo(() => {
    if (!revealed) return 'Choose the next step';
    return correct ? 'Correct' : 'Not quite';
  }, [revealed, correct]);

  function submitAnswer(index) {
    if (revealed) return;
    setSelectedIndex(index);
    setRevealed(true);

    if (index === activeCase.answer) {
      setScore((prev) => prev + 100);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  }

  function nextCase() {
    if (caseIndex === cases.length - 1) {
      setCaseIndex(0);
      setSelectedIndex(null);
      setRevealed(false);
      setStreak(0);
      return;
    }

    setCaseIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setRevealed(false);
  }

  return (
    <div className="page-shell">
      <div className="page-inner">
        <header className="hero-card">
          <div>
            <div className="eyebrow">Rhythm Study Game</div>
            <h1>Read the clues. Pick the rhythm branch. Learn the treatment.</h1>
            <p className="hero-copy">
              This is a quiz, not a simulation. Each case asks for the immediate treatment path so you can separate
              shock, CPR, antiarrhythmic infusion, and epinephrine.
            </p>
          </div>
          <div className="hero-stats">
            <StatCard label="Case" value={progress} />
            <StatCard label="Score" value={score} />
            <StatCard label="Streak" value={streak} />
          </div>
        </header>

        <main className="quiz-layout">
          <section className="panel case-panel">
            <div className="case-top">
              <div>
                <div className="eyebrow">{activeCase.title}</div>
                <h2>{activeCase.presentation}</h2>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard label="Monitor" value={activeCase.rhythm} />
              <StatCard label="Rate" value={`${activeCase.bpm}`} />
              <StatCard label="Pulse" value={activeCase.pulse} />
            </div>

            <div className="hemodynamics-card">
              <div className="stat-label">Presentation</div>
              <div className="stat-value">{activeCase.hemodynamics}</div>
            </div>

            <div className="trace-box">
              <svg viewBox="0 0 100 100" className="ecg-svg" aria-label="ECG trace">
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#f8fafc" stopOpacity="1" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="url(#lineGlow)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={activeCase.ecg}
                />
              </svg>
            </div>

            <div className="clue-box">
              <div className="eyebrow">Clues</div>
              <ul>
                {activeCase.clues.map((clue) => (
                  <li key={clue}>{clue}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="panel question-panel">
            <div className="question-head">
              <div className="eyebrow">Question</div>
              <h2>{heading}</h2>
              <p>{activeCase.question}</p>
            </div>

            <div className="options-grid">
              {activeCase.options.map((option, index) => {
                const isSelected = selectedIndex === index;
                const isCorrect = revealed && index === activeCase.answer;
                const isWrong = revealed && isSelected && index !== activeCase.answer;
                const stateClass = isCorrect ? 'option-correct' : isWrong ? 'option-wrong' : '';

                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-card ${stateClass}`}
                    disabled={revealed}
                    onClick={() => submitAnswer(index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>

            {revealed ? (
              <div className={`result-box ${correct ? 'result-correct' : 'result-wrong'}`}>
                <div className="eyebrow">Why</div>
                <p>{activeCase.why}</p>
                <div className="answer-line">
                  Best answer: <strong>{activeCase.options[activeCase.answer]}</strong>
                </div>
                <button type="button" className="primary-button" onClick={nextCase}>
                  {caseIndex === cases.length - 1 ? 'Restart cases' : 'Next case'}
                </button>
              </div>
            ) : (
              <div className="study-tip">
                <div className="eyebrow">How to think</div>
                <p>
                  Decide it yourself from the clues: first pulse or no pulse, then stable or unstable, then whether
                  the arrest rhythm is shockable or not. Use that logic to choose the next step.
                </p>
              </div>
            )}
          </section>
        </main>

        <footer className="footer-note">
          <p>
            Study framing only. Verified against the American Heart Association 2025 Adult Tachyarrhythmia With a
            Pulse Algorithm and 2025 Adult Cardiac Arrest Algorithm.
          </p>
        </footer>
      </div>
    </div>
  );
}
