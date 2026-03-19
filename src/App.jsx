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
  {
    id: 'first-degree-block',
    title: 'Case 5',
    rhythm: 'Sinus rhythm with a long but fixed PR interval',
    presentation: 'Incidental rhythm on a stable patient',
    bpm: 62,
    pulse: 'Regular pulse present',
    hemodynamics: 'Comfortable, talking, normal perfusion',
    clues: ['Every P wave is followed by a QRS', 'PR interval stays prolonged but constant', 'No dropped beats'],
    question: 'Which rhythm pattern best fits this strip?',
    options: ['First-degree AV block', 'Second-degree AV block', 'Third-degree AV block', 'Ventricular bigeminy'],
    answer: 0,
    why: 'This is first-degree AV block because every atrial impulse conducts, but the PR interval is prolonged and fixed. In an otherwise stable patient, this is usually monitored rather than shocked or paced.',
    ecg: '10,56 14,54 18,56 24,56 30,18 34,74 38,44 44,56 50,56 56,18 60,74 64,44 70,56 76,56 82,18 86,74',
  },
  {
    id: 'second-degree-block',
    title: 'Case 6',
    rhythm: 'Grouped beats with an occasional dropped QRS',
    presentation: 'Lightheaded patient with intermittent pauses',
    bpm: 44,
    pulse: 'Slow irregular pulse present',
    hemodynamics: 'Dizzy but not pulseless',
    clues: ['PR interval lengthens across the group', 'A P wave appears without a QRS after it', 'Then the cycle repeats'],
    question: 'Which rhythm pattern best fits this strip?',
    options: ['First-degree AV block', 'Second-degree AV block (Mobitz I)', 'Third-degree AV block', 'PEA'],
    answer: 1,
    why: 'Progressive PR prolongation followed by a dropped beat is the classic Wenckebach pattern, which is second-degree AV block type I. If symptomatic, treatment follows the bradycardia pathway rather than shock.',
    ecg: '8,56 14,54 20,56 28,18 32,74 36,44 42,56 48,54 56,56 64,18 68,74 72,44 78,54 84,56',
  },
  {
    id: 'third-degree-block',
    title: 'Case 7',
    rhythm: 'Severe bradycardia with AV dissociation',
    presentation: 'Near-syncope with very slow perfusion',
    bpm: 28,
    pulse: 'Very slow pulse present',
    hemodynamics: 'Pale, weak, about to pass out',
    clues: ['P waves and QRS complexes do not line up', 'Atrial activity marches through independently', 'Ventricular escape rhythm is slow'],
    question: 'Which rhythm pattern best fits this strip?',
    options: ['First-degree AV block', 'Second-degree AV block', 'Third-degree AV block', 'Ventricular trigeminy'],
    answer: 2,
    why: 'This is third-degree AV block because the atria and ventricles are dissociated. In a symptomatic patient, think pacing rather than cardioversion or defibrillation.',
    ecg: '10,54 16,56 22,54 30,20 34,76 38,46 46,54 52,56 58,54 66,20 70,76 74,46 82,54 88,56',
  },
  {
    id: 'bigeminy',
    title: 'Case 8',
    rhythm: 'Alternating normal beats and wide premature beats',
    presentation: 'Palpitations after caffeine and poor sleep',
    bpm: 88,
    pulse: 'Pulse present',
    hemodynamics: 'Stable and talking',
    clues: ['Every other beat is a PVC', 'The ectopic beat is wide and premature', 'Pattern repeats 1:1'],
    question: 'Which rhythm pattern best fits this strip?',
    options: ['First-degree AV block', 'Ventricular bigeminy', 'Ventricular trigeminy', 'Pulseless VT'],
    answer: 1,
    why: 'PVCs occurring every other beat is ventricular bigeminy. In a stable patient, the usual next step is assessment, monitoring, and correction of triggers rather than shock.',
    ecg: '10,56 16,18 20,76 24,44 32,56 38,18 42,76 46,44 54,56 60,18 64,76 68,44 76,56 82,18 86,76',
  },
  {
    id: 'trigeminy',
    title: 'Case 9',
    rhythm: 'Two normal beats followed by one wide premature beat',
    presentation: 'Intermittent skipped beats during observation',
    bpm: 84,
    pulse: 'Pulse present',
    hemodynamics: 'Stable and alert',
    clues: ['Every third beat is a PVC', 'Two conducted beats occur before the wide premature beat', 'Pattern repeats regularly'],
    question: 'Which rhythm pattern best fits this strip?',
    options: ['Ventricular bigeminy', 'Third-degree AV block', 'Ventricular trigeminy', 'Pulseless VT'],
    answer: 2,
    why: 'PVCs every third beat is ventricular trigeminy. Like bigeminy, this usually prompts evaluation of symptoms and triggers, not immediate shock in a stable patient.',
    ecg: '10,56 18,18 22,76 26,44 34,56 42,18 46,76 50,44 58,56 66,18 70,76 74,44 82,56',
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
              This is a quiz, not a simulation. Some cases test immediate treatment. Others test rhythm recognition.
              The goal is to learn both what the pattern is and what branch it belongs to.
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
