import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-6 px-6 border-t border-slate-800/80 text-center text-xs text-slate-500 mt-auto">
      InterviewIQ AI © {new Date().getFullYear()} • Powered by Gemini AI • All rights reserved.
    </footer>
  );
};

export default Footer;
