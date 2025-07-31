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

function App() {
  const [charikCount, setCharikCount] = useState(1);
  const [altToz, setAltToz] = useState<TozType>(
    calculateFromCharikCount(1, ALT_PERCENTAGES, ALT_TOTAL_PER_CHARIK)
  );
  const [ustToz, setUstToz] = useState<TozType>(
    calculateFromCharikCount(1, UST_PERCENTAGES, UST_TOTAL_PER_CHARIK)
  );

  const [isCharikModalOpen, setIsCharikModalOpen] = useState(false);
  const [tempCharikModalValue, setTempCharikModalValue] = useState<number>(0);

  const [isTozModalOpen, setIsTozModalOpen] = useState(false);
  const [currentEditingTozKey, setCurrentEditingTozKey] = useState<keyof TozType | null>(null);
  const [tempTozModalValue, setTempTozModalValue] = useState<number>(0);
  const [editingTozType, setEditingTozType] = useState<'alt' | 'ust' | null>(null);

  useEffect(() => {
    setAltToz(calculateFromCharikCount(charikCount, ALT_PERCENTAGES, ALT_TOTAL_PER_CHARIK));
    setUstToz(calculateFromCharikCount(charikCount, UST_PERCENTAGES, UST_TOTAL_PER_CHARIK));
  }, [charikCount]);

  const handleCharikChange = (value: number) => {
    const newValue = isNaN(value) ? 0 : value;
    setCharikCount(Math.max(1, newValue));
  };

  const handleAltChange = (key: keyof TozType, value: number) => {
    const { toz, charikCount: newCharikCount } = calculateFromOneValue(
      key, value, ALT_PERCENTAGES, ALT_TOTAL_PER_CHARIK
    );
    setCharikCount(Math.max(1, newCharikCount));
    setAltToz(toz);
  };

  const handleUstChange = (key: keyof TozType, value: number) => {
    const { toz, charikCount: newCharikCount } = calculateFromOneValue(
      key, value, UST_PERCENTAGES, UST_TOTAL_PER_CHARIK
    );
    setCharikCount(Math.max(1, newCharikCount));
    setUstToz(toz);
  };

  const handleReset = () => {
    setCharikCount(1);
  };

  const openTozModal = (key: keyof TozType, currentValue: number, type: 'alt' | 'ust') => {
    setCurrentEditingTozKey(key);
    setTempTozModalValue(currentValue);
    setIsTozModalOpen(true);
    setEditingTozType(type);
  };

  const closeTozModal = () => {
    setIsTozModalOpen(false);
    setCurrentEditingTozKey(null);
    setTempTozModalValue(0);
    setEditingTozType(null);
  };

  const handleTozModalConfirm = (confirmedValue: number) => {
    if (currentEditingTozKey && editingTozType) {
      if (editingTozType === 'alt') {
        handleAltChange(currentEditingTozKey, confirmedValue);
      } else {
        handleUstChange(currentEditingTozKey, confirmedValue);
      }
    }
    closeTozModal();
  };

  const openCharikModal = () => {
    setTempCharikModalValue(charikCount);
    setIsCharikModalOpen(true);
  };

  const closeCharikModal = () => {
    setIsCharikModalOpen(false);
    setTempCharikModalValue(0);
  };

  const handleCharikModalConfirm = (confirmedValue: number) => {
    handleCharikChange(confirmedValue);
    closeCharikModal();
  };

  const renderInputs = (
    title: string,
    data: TozType,
    type: 'alt' | 'ust'
  ) => (
    <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
      <h2 className="text-2xl font-extrabold text-blue-800 mb-4 text-center">{title}</h2>
      {(["a", "b", "c", "d", "total"] as (keyof TozType)[]).map((key) => (
        <div key={key} className="flex items-center justify-between gap-4 my-3">
          <label className="w-24 text-lg font-medium text-gray-700 uppercase">{key}:</label>
          <input
            type="text"
            readOnly
            className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-right cursor-pointer"
            value={data[key].toFixed(2)}
            onClick={() => openTozModal(key, data[key], type)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <div className="w-full max-w-5xl mx-auto space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8 tracking-tight">
          ÇARIK TOZ HESAPLAYICI
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-blue-50 rounded-xl shadow-inner border border-blue-200">
          <label htmlFor="charik-count" className="text-xl font-semibold text-blue-700">
            Çarık Sayısı:
          </label>
          <input
            id="charik-count"
            type="text"
            readOnly
            className="w-full sm:w-40 p-3 border border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center text-xl font-bold text-blue-800 cursor-pointer"
            value={charikCount.toFixed(2)}
            onClick={openCharikModal}
          />
          <button
            onClick={handleReset}
            className="mt-4 sm:mt-0 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            Sıfırla
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderInputs("ALT TOZ", altToz, 'alt')}
          {renderInputs("ÜST TOZ", ustToz, 'ust')}
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          Değerleri girdikçe diğer değerler otomatik olarak hesaplanır. Değeri değiştirmek için kutuya tıklayın, açılan pencerede değeri girip onaylayın.
        </p>
      </div>

      {isCharikModalOpen && (
        <EditValueModal
          isOpen={isCharikModalOpen}
          onClose={closeCharikModal}
          onConfirm={handleCharikModalConfirm}
          initialValue={charikCount}
          label="ÇARIK SAYISI"
        />
      )}

      {isTozModalOpen && currentEditingTozKey && (
        <EditValueModal
          isOpen={isTozModalOpen}
          onClose={closeTozModal}
          onConfirm={handleTozModalConfirm}
          initialValue={tempTozModalValue}
          label={currentEditingTozKey.toUpperCase()}
        />
      )}
    </div>
  );
}

export default App;
