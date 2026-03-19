import React, { useState } from 'react';

const strips = [
  {
    id: 'vt',
    label: 'Ventricular tachycardia',
    rate: 'Fast',
    clue: 'Wide regular tachycardia',
    ecg: '4,56 12,56 18,52 22,18 28,84 34,30 40,56 46,56 52,52 56,18 62,84 68,30 74,56 80,56 86,52 90,18 96,84 102,30 108,56 114,56 120,52 124,18 130,84 136,30 142,56 148,56 154,52 158,18 164,84 170,30 176,56 182,56 188,52 192,18 198,84 204,30 210,56 216,56 222,52 226,18 232,84 238,30 244,56 250,56 256,52 260,18 266,84 272,30 278,56 286,56',
    options: ['Ventricular tachycardia', 'Ventricular bigeminy', 'Third-degree AV block', 'PEA'],
    answer: 0,
  },
  {
    id: 'first-degree',
    label: 'First-degree AV block',
    rate: 'Slow-normal',
    clue: 'Long fixed PR, every P conducts',
    ecg: '4,58 12,58 18,56 22,52 26,56 34,58 42,58 50,58 58,58 66,18 70,84 74,46 82,56 90,58 98,58 106,58 114,58 122,18 126,84 130,46 138,56 146,58 154,58 162,58 170,58 178,18 182,84 186,46 194,56 202,58 210,58 218,58 226,58 234,18 238,84 242,46 250,56 258,58 266,58 274,58 282,58',
    options: ['Second-degree AV block', 'First-degree AV block', 'Sinus tachycardia', 'Ventricular trigeminy'],
    answer: 1,
  },
  {
    id: 'second-degree',
    label: 'Second-degree AV block',
    rate: 'Bradycardic',
    clue: 'Progressive delay then dropped beat',
    ecg: '4,58 12,58 18,56 22,52 26,56 34,58 42,58 50,58 58,18 62,84 66,46 74,56 82,58 90,58 98,56 102,52 106,56 114,58 122,58 130,58 138,18 142,84 146,46 154,56 162,58 170,56 174,52 178,56 186,58 194,58 202,56 206,52 210,56 218,58 226,58 234,58 242,58 250,18 254,84 258,46 266,56 274,58 282,58',
    options: ['Second-degree AV block', 'First-degree AV block', 'Third-degree AV block', 'Bigeminy'],
    answer: 0,
  },
  {
    id: 'third-degree',
    label: 'Third-degree AV block',
    rate: 'Very slow',
    clue: 'AV dissociation',
    ecg: '4,58 10,54 16,58 22,54 28,58 34,22 38,84 42,46 50,58 56,54 62,58 68,54 74,58 80,22 84,84 88,46 96,58 102,54 108,58 114,54 120,58 126,22 130,84 134,46 142,58 148,54 154,58 160,54 166,58 172,22 176,84 180,46 188,58 194,54 200,58 206,54 212,58 218,22 222,84 226,46 234,58 240,54 246,58 252,54 258,58 264,22 268,84 272,46 280,58 286,54',
    options: ['Second-degree AV block', 'Ventricular tachycardia', 'Third-degree AV block', 'PEA'],
    answer: 2,
  },
  {
    id: 'bigeminy',
    label: 'Ventricular bigeminy',
    rate: 'Variable',
    clue: 'Every other beat is a PVC',
    ecg: '4,58 12,58 18,54 22,18 26,84 30,46 38,56 46,58 54,58 62,30 66,82 72,40 80,58 88,58 96,54 100,18 104,84 108,46 116,56 124,58 132,58 140,30 144,82 150,40 158,58 166,58 174,54 178,18 182,84 186,46 194,56 202,58 210,58 218,30 222,82 228,40 236,58 244,58 252,54 256,18 260,84 264,46 272,56 280,58',
    options: ['Ventricular trigeminy', 'Ventricular tachycardia', 'First-degree AV block', 'Ventricular bigeminy'],
    answer: 3,
  },
  {
    id: 'trigeminy',
    label: 'Ventricular trigeminy',
    rate: 'Variable',
    clue: 'Every third beat is a PVC',
    ecg: '4,58 12,58 18,54 22,18 26,84 30,46 38,56 46,58 54,54 58,18 62,84 66,46 74,56 82,58 90,58 98,30 102,82 108,40 116,56 124,58 132,54 136,18 140,84 144,46 152,56 160,58 168,58 176,30 180,82 186,40 194,56 202,58 210,54 214,18 218,84 222,46 230,56 238,58 246,58 254,30 258,82 264,40 272,56 280,58',
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

function EcgStrip({ points }) {
  const smallLines = [];
  const largeLines = [];

  for (let x = 0; x <= 300; x += 4) {
    smallLines.push(<line key={`sx-${x}`} x1={x} y1="0" x2={x} y2="100" className="grid-small" />);
  }

  for (let y = 0; y <= 100; y += 4) {
    smallLines.push(<line key={`sy-${y}`} x1="0" y1={y} x2="300" y2={y} className="grid-small" />);
  }

  for (let x = 0; x <= 300; x += 20) {
    largeLines.push(<line key={`lx-${x}`} x1={x} y1="0" x2={x} y2="100" className="grid-large" />);
  }

  for (let y = 0; y <= 100; y += 20) {
    largeLines.push(<line key={`ly-${y}`} x1="0" y1={y} x2="300" y2={y} className="grid-large" />);
  }

  return (
    <svg viewBox="0 0 300 100" className="ecg-svg" aria-label="Rhythm strip">
      <rect x="0" y="0" width="300" height="100" className="strip-background" />
      {smallLines}
      {largeLines}
      <polyline
        fill="none"
        stroke="url(#stripLine)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <defs>
        <linearGradient id="stripLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
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
            <div className="meta-item">
              <span>Paper</span>
              <strong>1 mm / 5 mm grid</strong>
            </div>
          </div>

          <div className="trace-box">
            <EcgStrip points={strip.ecg} />
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
