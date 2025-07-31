import React, { useState, useEffect } from "react";

// Constants for Alt and Ust Toz calculations
const ALT_PERCENTAGES = { a: 0.5, b: 0.39, c: 0.06, d: 0.05 };
const ALT_TOTAL_PER_CHARIK = 121;
const UST_PERCENTAGES = { a: 0.3, b: 0.6, c: 0.06, d: 0.04 };
const UST_TOTAL_PER_CHARIK = 45;

// Type definition for Toz structure
type TozType = {
  a: number;
  b: number;
  c: number;
  d: number;
  total: number;
};

// Type definition for EditValueModal props
type EditValueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  initialValue: number;
  label: string;
};

/**
 * Calculates 'Toz' values and total based on the charik count and predefined percentages.
 */
function calculateFromCharikCount(
  count: number,
  percentages: Record<string, number>,
  totalPerCharik: number
): TozType {
  const validCount = isNaN(count) || count < 0 ? 0 : count;
  const total = totalPerCharik * validCount;
  return {
    a: percentages.a * total,
    b: percentages.b * total,
    c: percentages.c * total,
    d: percentages.d * total,
    total,
  };
}

/**
 * Calculates 'Toz' values and charik count based on a single changed value.
 */
function calculateFromOneValue(
  changedKey: keyof TozType,
  changedValue: number,
  percentages: Record<string, number>,
  totalPerCharikRef: number
): { toz: TozType; charikCount: number } {
  const validChangedValue = isNaN(changedValue) || changedValue < 0 ? 0 : changedValue;
  let total: number;
  if (changedKey === "total") {
    total = validChangedValue;
  } else {
    total = percentages[changedKey] !== 0 ? validChangedValue / percentages[changedKey] : 0;
  }
  const toz: TozType = {
    a: percentages.a * total,
    b: percentages.b * total,
    c: percentages.c * total,
    d: percentages.d * total,
    total,
  };
  const charikCount = totalPerCharikRef !== 0 ? total / totalPerCharikRef : 0;
  return { toz, charikCount };
}

/**
 * A modal component for editing a single numeric value.
 */
const EditValueModal = ({ isOpen, onClose, onConfirm, initialValue, label }: EditValueModalProps) => {
  const [inputValue, setInputValue] = useState(String(initialValue));
  useEffect(() => {
    setInputValue(String(initialValue));
  }, [initialValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onConfirm(parseFloat(inputValue || '0'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 text-center">Değer Düzenle: {label}</h3>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-center text-xl font-bold focus:ring-blue-500 focus:border-blue-500"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          >
            İptal
          </button>
          <button
            onClick={() => onConfirm(parseFloat(inputValue || '0'))}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
};
