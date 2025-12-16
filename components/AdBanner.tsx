
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdBanner: React.FC<{ className?: string }> = ({ className = "" }) => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Evita chamadas duplicadas no React StrictMode
    if (initialized.current) return;

    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initialized.current = true;
      }
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }, []);

  return (
    <div className={`w-full flex flex-col items-center my-6 ${className}`}>
      <span className="text-[10px] text-gray-300 uppercase tracking-widest mb-1">Publicidade</span>
      <div className="w-full bg-white min-h-[100px] rounded-xl overflow-hidden flex justify-center items-center border border-gray-100 shadow-sm">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client="ca-pub-3279546603561312"
          data-ad-slot="5948372615"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};

export default AdBanner;
