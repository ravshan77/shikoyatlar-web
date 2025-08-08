import React, { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Button } from './ui/Button.tsx';

interface TwoFactorAuthProps {
  onAuthenticate: (code: string) => Promise<boolean>;
  isLoading: boolean;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onAuthenticate,
  isLoading,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1); // Only take the last digit
    setDigits(newDigits);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newDigits.every(digit => digit !== '') && newDigits.join('').length === 6) {
      handleSubmit(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = paste.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setDigits(newDigits);
    
    if (paste.length === 6) {
      handleSubmit(paste);
    }
  };

  const handleSubmit = async (code?: string) => {
    const authCode = code || digits.join('');
    if (authCode.length !== 6) {
      setError('6 raqamli kodni kiriting');
      return;
    }

    try {
      const success = await onAuthenticate(authCode);
      if (!success) {
        setError('Noto\'g\'ri kod. Qaytadan urinib ko\'ring.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const filledDigits = digits.filter(digit => digit !== '').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Kirish</h1>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm">
            Garant Staff ilovasiga kirib authenticator bo'limidagi 6 xonalik sonni kiriting.
          </p>
        </div>

        {/* Digit Inputs */}
        <div className="flex justify-center space-x-3 mb-6">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 ${
                digit
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm text-gray-600">
              {6 - filledDigits} ta son qoldi
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={() => handleSubmit()}
          isLoading={isLoading}
          disabled={digits.some(digit => digit === '') || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Tekshirilmoqda...' : 'Kirish'}
        </Button>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Kodingizni Garant Staff mobile ilovasidan oling
          </p>
        </div>
      </div>
    </div>
  );
};