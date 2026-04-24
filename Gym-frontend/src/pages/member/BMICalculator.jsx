import { useState } from 'react';
import MemberLayout from '../../components/layouts/MemberLayout';
import { useAuth } from '../../context/AuthContext';
import {
  FiActivity,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiAward,
  FiRefreshCw,
} from 'react-icons/fi';

const BMI_CATEGORIES = [
  {
    label: 'Underweight',
    min: 0,
    max: 18.5,
    color: '#3b82f6',
    bg: '#eff6ff',
    icon: <FiAlertCircle />,
    tip: 'You need to gain weight. Focus on a protein-rich, calorie-surplus diet.',
  },
  {
    label: 'Normal',
    min: 18.5,
    max: 25,
    color: '#22c55e',
    bg: '#f0fdf4',
    icon: <FiCheckCircle />,
    tip: 'Great! Maintain your healthy weight with balanced meals and regular exercise.',
  },
  {
    label: 'Overweight',
    min: 25,
    max: 30,
    color: '#f59e0b',
    bg: '#fffbeb',
    icon: <FiTrendingUp />,
    tip: 'Consider a calorie-deficit diet and increase cardio sessions at the gym.',
  },
  {
    label: 'Obese',
    min: 30,
    max: 999,
    color: '#ef4444',
    bg: '#fef2f2',
    icon: <FiAlertCircle />,
    tip: 'Consult a trainer or doctor. Focus on consistent exercise and a structured diet plan.',
  },
];

function getCategory(bmi) {
  return BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max) || BMI_CATEGORIES[0];
}

export default function BMICalculator() {
  const { plan: contextPlan } = useAuth();
  const isPremium = contextPlan === 'PREMIUM';

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || w <= 0 || h <= 0) return;
    setBmi((w / (h * h)).toFixed(1));
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
  };

  const category = bmi ? getCategory(parseFloat(bmi)) : null;

  const heightM = parseFloat(height) / 100;
  const idealMin = heightM > 0 ? (18.5 * heightM * heightM).toFixed(1) : null;
  const idealMax = heightM > 0 ? (24.9 * heightM * heightM).toFixed(1) : null;

  return (
    <MemberLayout>
      <div className="p-6">

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-full bg-yellow-100">
            <FiActivity className="text-yellow-500 text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">BMI Calculator</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Know your Body Mass Index and track your health
            </p>
          </div>
          {isPremium && (
            <span className="ml-auto flex items-center gap-1 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
              <FiAward className="text-sm" /> PREMIUM
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ─── LEFT COLUMN ─── */}
          <div className="flex flex-col gap-6">

            {/* Input Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold text-gray-700 mb-5 flex items-center gap-2">
                <FiInfo className="text-yellow-500" />
                Enter Your Details
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:border-yellow-400 transition"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 175"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:border-yellow-400 transition"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={calculate}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition"
                >
                  <FiActivity />
                  Calculate BMI
                </button>
                {bmi && (
                  <button
                    onClick={reset}
                    className="flex items-center gap-1 px-4 py-3 border border-gray-200 text-gray-500 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    <FiRefreshCw className="text-sm" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Result Card */}
            {bmi && category && (
              <div
                className="bg-white rounded-xl shadow p-6 w-full"
                style={{ borderTop: `4px solid ${category.color}` }}
              >
                {/* Score row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-5xl font-black" style={{ color: category.color }}>
                      {bmi}
                    </div>
                    <div className="text-sm text-gray-400 font-semibold mt-1">Your BMI Score</div>
                  </div>
                  <div
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl font-bold text-sm"
                    style={{ background: category.bg, color: category.color }}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    {category.label}
                  </div>
                </div>

                {/* Health tip */}
                <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <FiInfo className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  {category.tip}
                </div>

                {/* Ideal weight — Premium only */}
                {isPremium && idealMin && idealMax && (
                  <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                    <FiAward className="flex-shrink-0" />
                    <span>
                      <strong>Ideal Weight Range:</strong> {idealMin} – {idealMax} kg
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="flex flex-col gap-6">

            {/* BMI Reference Table */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold text-gray-700 mb-5 flex items-center gap-2">
                <FiCheckCircle className="text-yellow-500" />
                BMI Reference Chart
              </h2>
              <div className="space-y-3">
                {BMI_CATEGORIES.map((c) => {
                  const isActive = category?.label === c.label;
                  return (
                    <div
                      key={c.label}
                      className="flex items-center justify-between px-4 py-3 rounded-lg transition-all"
                      style={{
                        background: isActive ? c.color + '15' : '#f9fafb',
                        border: `1.5px solid ${isActive ? c.color + '66' : 'transparent'}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {/* Colored dot */}
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm"
                          style={{ background: c.color }}
                        >
                          {c.icon}
                        </span>
                        <span className="font-semibold text-gray-700 text-sm">{c.label}</span>
                      </div>
                      <span className="text-gray-400 text-sm font-semibold">
                        {c.min === 0 ? '< 18.5' : c.max === 999 ? '≥ 30.0' : `${c.min} – ${c.max}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>





          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
