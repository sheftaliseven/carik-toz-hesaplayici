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

/**
 * Calculates 'Toz' values and total based on the charik count and predefined percentages.
 * @param count The number of 'chariks'.
 * @param percentages An object containing the percentage distribution for 'a', 'b', 'c', 'd'.
 * @param totalPerCharik The total 'toz' value per charik.
 * @returns An object of type TozType containing calculated 'a', 'b', 'c', 'd' values and the total.
 */
function calculateFromCharikCount(
  count: number,
  percentages: Record<string, number>,
  totalPerCharik: number
): TozType {
  // Ensure count is a valid non-negative number
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
 * @param changedKey The key (e.g., 'a', 'b', 'total') that was changed.
 * @param changedValue The new value for the changed key.
 * @param percentages An object containing the percentage distribution for 'a', 'b', 'c', 'd'.
 * @param totalPerCharikRef The reference total 'toz' value per charik.
 * @returns An object containing the calculated TozType and the new charik count.
 */
function calculateFromOneValue(
  changedKey: keyof TozType,
  changedValue: number,
  percentages: Record<string, number>,
  totalPerCharikRef: number
): { toz: TozType; charikCount: number } {
  // Ensure changedValue is a valid non-negative number
  const validChangedValue = isNaN(changedValue) || changedValue < 0 ? 0 : changedValue;

  let total: number;
  // If the changed key is 'total', use its value directly.
  // Otherwise, calculate the total based on the changed value and its percentage.
  if (changedKey === "total") {
    total = validChangedValue;
  } else {
    total = percentages[changedKey] !== 0 ? validChangedValue / percentages[changedKey] : 0;
  }

  // Calculate individual 'toz' components based on the new total
  const toz: TozType = {
    a: percentages.a * total,
    b: percentages.b * total,
    c: percentages.c * total,
    d: percentages.d * total,
    total,
  };

  // Calculate the new charik count based on the calculated total
  const charikCount = totalPerCharikRef !== 0 ? total / totalPerCharikRef : 0;
  return { toz, charikCount };
}

/**
 * A modal component for editing a single numeric value.
 * @param isOpen - Controls the visibility of the modal.
 * @param onClose - Callback function to close the modal without confirming.
 * @param onConfirm - Callback function to confirm the new value.
 * @param initialValue - The initial value to display in the input field (can be empty string).
 * @param label - The label for the value being edited (e.g., "A", "Total").
 */
const EditValueModal = ({ isOpen, onClose, onConfirm, initialValue, label }) => {
  // State for the input value, allowing it to be an empty string
  const [inputValue, setInputValue] = useState(String(initialValue));

  // Synchronize modal's input value with initialValue prop when it changes
  useEffect(() => {
    setInputValue(String(initialValue));
  }, [initialValue]);

  /**
   * Handles changes to the input field within the modal.
   * Updates local state.
   * @param e The React ChangeEvent from the input.
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Allow empty string
  };

  /**
   * Handles key down events, specifically for the Enter key to trigger confirmation.
   * @param e The React KeyboardEvent.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onConfirm(parseFloat(inputValue || '0')); // Parse to number, treat empty as 0
    }
  };

  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 text-center">Değer Düzenle: {label}</h3>
        <input
          type="number" // Use number type for keyboard, but handle empty string in state
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-center text-xl font-bold focus:ring-blue-500 focus:border-blue-500"
          value={inputValue} // Bind to string state
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus // Focus on the input when modal opens
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          >
            İptal
          </button>
          <button
            onClick={() => onConfirm(parseFloat(inputValue || '0'))} // Parse to number, treat empty as 0
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main App component for the Çarık Toz Hesaplayıcı.
 * Allows users to calculate 'Alt Toz' and 'Üst Toz' based on charik count,
 * or by inputting individual 'toz' component values.
 */
export default function App() {
  // State for the number of chariks
  const [charikCount, setCharikCount] = useState(1);
  // State for 'Alt Toz' calculations
  const [altToz, setAltToz] = useState<TozType>(
    calculateFromCharikCount(1, ALT_PERCENTAGES, ALT_TOTAL_PER_CHARIK)
  );
  // State for 'Üst Toz' calculations
  const [ustToz, setUstToz] = useState<TozType>(
    calculateFromCharikCount(1, UST_PERCENTAGES, UST_TOTAL_PER_CHARIK)
  );

  // State for Charik Count modal visibility and temporary value
  const [isCharikModalOpen, setIsCharikModalOpen] = useState(false);
  const [tempCharikModalValue, setTempCharikModalValue] = useState<number>(0);

  // State for Toz component modal visibility and temporary value
  const [isTozModalOpen, setIsTozModalOpen] = useState(false);
  const [currentEditingTozKey, setCurrentEditingTozKey] = useState<keyof TozType | null>(null);
  const [tempTozModalValue, setTempTozModalValue] = useState<number>(0);


  // Effect hook to recalculate 'Alt Toz' and 'Üst Toz' whenever charikCount changes
  useEffect(() => {
    setAltToz(calculateFromCharikCount(charikCount, ALT_PERCENTAGES, ALT_TOTAL_PER_CHARIK));
    setUstToz(calculateFromCharikCount(charikCount, UST_PERCENTAGES, UST_TOTAL_PER_CHARIK));
  }, [charikCount]); // Dependency array: runs when charikCount changes

  /**
   * Handles changes to the charik count input.
   * @param value The new value for charik count.
   */
  const handleCharikChange = (value: number) => {
    const newValue = isNaN(value) ? 0 : value;
    setCharikCount(Math.max(1, newValue)); // Ensure charik count is at least 1
  };

  /**
   * Handles changes to 'Alt Toz' component values.
   * Recalculates charik count and 'Alt Toz' based on the changed component.
   * @param key The specific 'toz' component ('a', 'b', 'c', 'd', 'total') that was changed.
   * @param value The new value for the changed 'toz' component.
   */
  const handleAltChange = (key: keyof TozType, value: number) => {
    const { toz, charikCount: newCharikCount } = calculateFromOneValue(
      key,
      value,
      ALT_PERCENTAGES,
      ALT_TOTAL_PER_CHARIK
    );
    setCharikCount(Math.max(1, newCharikCount)); // Update charik count based on 'Alt Toz' change
    setAltToz(toz); // Update 'Alt Toz' state
  };

  /**
   * Handles changes to 'Üst Toz' component values.
   * Recalculates charik count and 'Üst Toz' based on the changed component.
   * @param key The specific 'toz' component ('a', 'b', 'c', 'd', 'total') that was changed.
   * @param value The new value for the changed 'toz' component.
   */
  const handleUstChange = (key: keyof TozType, value: number) => {
    const { toz, charikCount: newCharikCount } = calculateFromOneValue(
      key,
      value,
      UST_PERCENTAGES,
      UST_TOTAL_PER_CHARIK
    );
    setCharikCount(Math.max(1, newCharikCount)); // Update charik count based on 'Üst Toz' change
    setUstToz(toz); // Update 'Üst Toz' state
  };

  /**
   * Resets the charik count to 1.
   */
  const handleReset = () => {
    setCharikCount(1);
  };

  /**
   * Opens the modal for editing a specific 'toz' component.
   * @param key The key of the 'toz' component to edit.
   * @param currentValue The current value of the component.
   * @param type The type of toz (alt or ust) to determine which handler to call.
   */
  const openTozModal = (key: keyof TozType, currentValue: number, type: 'alt' | 'ust') => {
    setCurrentEditingTozKey(key);
    setTempTozModalValue(currentValue);
    setIsTozModalOpen(true);
    // Store which type of toz is being edited to call the correct handler on confirm
    if (type === 'alt') {
      setEditingTozType('alt');
    } else {
      setEditingTozType('ust');
    }
  };

  const closeTozModal = () => {
    setIsTozModalOpen(false);
    setCurrentEditingTozKey(null);
    setTempTozModalValue(0);
    setEditingTozType(null);
  };

  const [editingTozType, setEditingTozType] = useState<'alt' | 'ust' | null>(null);

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

  /**
   * Opens the modal for editing charik count.
   */
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

  /**
   * Renders a set of input fields for 'Toz' components.
   * Each input field now opens a modal for editing.
   * @param title The title for the input section (e.g., "ALT TOZ").
   * @param data The current TozType data to display in the inputs.
   * @param type The type of toz (alt or ust) for modal context.
   * @returns JSX for the input section.
   */
  const renderInputs = (
    title: string,
    data: TozType,
    type: 'alt' | 'ust'
  ) => {
    return (
      <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
        <h2 className="text-2xl font-extrabold text-blue-800 mb-4 text-center">{title}</h2>
        {/* Render input fields for 'a', 'b', 'c', 'd', and 'total' */}
        {(["a", "b", "c", "d", "total"] as (keyof TozType)[]).map((key) => (
          <div key={key} className="flex items-center justify-between gap-4 my-3">
            <label className="w-24 text-lg font-medium text-gray-700 uppercase">{key}:</label>
            <input
              type="text" // Changed to text as it's now read-only for display
              readOnly // Make input read-only
              className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-right cursor-pointer"
              value={data[key].toFixed(2)} // Display with 2 decimal places
              onClick={() => openTozModal(key, data[key], type)} // Open modal on click
            />
          </div>
        ))}
      </div>
    );
  };

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
            type="text" // Changed to text to open modal
            readOnly // Make input read-only
            className="w-full sm:w-40 p-3 border border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center text-xl font-bold text-blue-800 cursor-pointer"
            value={charikCount.toFixed(2)} // Display with 2 decimal places
            onClick={openCharikModal} // Open modal on click
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

      {/* Render Charik Count modal */}
      {isCharikModalOpen && (
        <EditValueModal
          isOpen={isCharikModalOpen}
          onClose={closeCharikModal}
          onConfirm={handleCharikModalConfirm}
          initialValue={charikCount}
          label="ÇARIK SAYISI"
        />
      )}

      {/* Render Toz component modal */}
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
