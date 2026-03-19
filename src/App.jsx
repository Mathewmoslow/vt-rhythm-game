import React, { useState } from 'react';

const strips = [
  {
    id: 'vt',
    label: 'Ventricular tachycardia',
    rate: 'Fast',
    clue: 'Wide regular tachycardia',
    ecg: '10,56 16,52 22,18 28,80 34,38 40,54 46,50 52,20 58,82 64,40 70,54 76,50 82,18 88,80',
    options: ['Ventricular tachycardia', 'Ventricular bigeminy', 'Third-degree AV block', 'PEA'],
    answer: 0,
  },
  {
    id: 'first-degree',
    label: 'First-degree AV block',
    rate: 'Slow-normal',
    clue: 'Long fixed PR, every P conducts',
    ecg: '8,58 12,54 18,58 28,58 34,20 38,78 42,44 52,58 58,58 64,20 68,78 72,44 82,58 88,58',
    options: ['Second-degree AV block', 'First-degree AV block', 'Sinus tachycardia', 'Ventricular trigeminy'],
    answer: 1,
  },
  {
    id: 'second-degree',
    label: 'Second-degree AV block',
    rate: 'Bradycardic',
    clue: 'Progressive delay then dropped beat',
    ecg: '8,58 14,56 22,58 30,20 34,78 38,44 46,58 54,56 64,58 74,20 78,78 82,44',
    options: ['Second-degree AV block', 'First-degree AV block', 'Third-degree AV block', 'Bigeminy'],
    answer: 0,
  },
  {
    id: 'third-degree',
    label: 'Third-degree AV block',
    rate: 'Very slow',
    clue: 'AV dissociation',
    ecg: '8,58 14,56 20,58 30,22 34,78 38,44 48,56 54,58 60,56 70,22 74,78 78,44 88,58',
    options: ['Second-degree AV block', 'Ventricular tachycardia', 'Third-degree AV block', 'PEA'],
    answer: 2,
  },
  {
    id: 'bigeminy',
    label: 'Ventricular bigeminy',
    rate: 'Variable',
    clue: 'Every other beat is a PVC',
    ecg: '10,58 18,20 22,80 26,42 36,58 44,20 48,80 52,42 62,58 70,20 74,80 78,42',
    options: ['Ventricular trigeminy', 'Ventricular tachycardia', 'First-degree AV block', 'Ventricular bigeminy'],
    answer: 3,
  },
  {
    id: 'trigeminy',
    label: 'Ventricular trigeminy',
    rate: 'Variable',
    clue: 'Every third beat is a PVC',
    ecg: '8,58 16,20 20,78 24,44 34,58 42,20 46,78 50,44 60,58 68,20 72,78 76,44 86,58',
    options: ['Ventricular bigeminy', 'Ventricular trigeminy', 'Third-degree AV block', 'VT'],
    answer: 1,
  },
];

function ScorePill({ label, value }) {
  return (
    <div className="score-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const strip = strips[index];
  const correct = selected === strip.answer;

  function choose(optionIndex) {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    if (optionIndex === strip.answer) {
      setScore((prev) => prev + 1);
    }
  }

  function next() {
    setIndex((prev) => (prev + 1) % strips.length);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="page-shell">
      <div className="app-card">
        <header className="topbar">
          <div>
            <div className="eyebrow">Strip ID</div>
            <h1>Identify the rhythm</h1>
          </div>
          <div className="score-row">
            <ScorePill label="Strip" value={`${index + 1}/${strips.length}`} />
            <ScorePill label="Score" value={score} />
          </div>
        </header>

        <section className="strip-card">
          <div className="strip-meta">
            <div className="meta-item">
              <span>Rate</span>
              <strong>{strip.rate}</strong>
            </div>
          </div>

          <div className="trace-box">
            <svg viewBox="0 0 100 100" className="ecg-svg" aria-label="Rhythm strip">
              <defs>
                <linearGradient id="stripLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#a7f3d0" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="url(#stripLine)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={strip.ecg}
              />
            </svg>
          </div>
        </section>

        <section className="options-card">
          <div className="eyebrow">Choose one</div>
          <div className="options-grid">
            {strip.options.map((option, optionIndex) => {
              const isCorrect = revealed && optionIndex === strip.answer;
              const isWrong = revealed && selected === optionIndex && optionIndex !== strip.answer;
              return (
                <button
                  key={option}
                  type="button"
                  className={`option-button ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => choose(optionIndex)}
                  disabled={revealed}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {revealed ? (
            <div className="result-card">
              <p>{correct ? 'Correct.' : 'Incorrect.'} Answer: <strong>{strip.label}</strong></p>
              <p className="clue-line">{strip.clue}</p>
              <button type="button" className="next-button" onClick={next}>
                Next strip
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
