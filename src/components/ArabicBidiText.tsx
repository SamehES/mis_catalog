import React from 'react';

interface ArabicBidiTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Isolates Arabic words and LTR numbers/codes into separate inline-block elements.
 * This completely prevents html2canvas canvas renderer from overlapping mixed RTL/LTR text during PDF generation.
 */
export const ArabicBidiText: React.FC<ArabicBidiTextProps> = ({
  text,
  className = '',
  style,
}) => {
  if (!text) return null;

  // Split string by numbers (including decimals or digits with units like 2, 2.5, 500)
  const tokens = text.split(/(\d+(?:\.\d+)?)/g);

  return (
    <span
      dir="rtl"
      className={`inline-block text-center ${className}`}
      style={{
        unicodeBidi: 'isolate',
        letterSpacing: 'normal',
        wordSpacing: 'normal',
        ...style,
      }}
    >
      {tokens.map((token, index) => {
        if (!token) return null;

        const isNumber = /^\d+(?:\.\d+)?$/.test(token);

        if (isNumber) {
          return (
            <span
              key={index}
              dir="ltr"
              style={{
                display: 'inline-block',
                unicodeBidi: 'isolate',
                margin: '0 3px',
                fontVariantNumeric: 'lining-nums',
                fontWeight: 'bold',
              }}
            >
              {token}
            </span>
          );
        }

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              unicodeBidi: 'isolate',
              whiteSpace: 'pre-wrap',
            }}
          >
            {token}
          </span>
        );
      })}
    </span>
  );
};
