import React, { useState, useRef } from 'react';
import { Download, Layout } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

export const CertificateGeneratorScreen: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [recipientName, setRecipientName] = useState('John Doe');
  const [achievement, setAchievement] = useState('Man of the Match');
  const [matchDate, setMatchDate] = useState('2026-06-15');
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      alert('Certificate exported as PDF! (Simulation)');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden">
      
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto z-10">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            Certificate Builder
          </h2>
        </div>

        <div className="p-4 space-y-6 flex-1">
          {/* Templates */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Template</label>
            <div className="grid grid-cols-2 gap-2">
              {['modern', 'classic', 'sporty', 'minimal'].map(t => (
                <Button
                  key={t}
                  variant={selectedTemplate === t ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedTemplate(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input
              label="Recipient Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <Input
              label="Achievement"
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Button 
            onClick={handleDownload}
            disabled={isGenerating}
            isLoading={isGenerating}
            className="w-full gap-2"
          >
             {!isGenerating && <Download className="w-4 h-4" />} Download PDF
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center overflow-auto relative">
        <div className="absolute inset-0 pattern-grid-lg opacity-5 pointer-events-none" />
        
        {/* The Certificate Canvas */}
        <div 
          ref={certificateRef}
          className={`bg-white shadow-2xl relative transition-all duration-300 transform origin-center ${isGenerating ? 'scale-95 opacity-80' : 'scale-100'} w-[800px] h-[566px] ${
            selectedTemplate === 'classic'
              ? '[background-image:radial-gradient(circle,_#fff_0%,_#fdfbf7_100%)] [border:20px_solid_#fde68a]'
              : 'bg-gradient-to-tr from-white to-slate-100'
          }`}
        >
          {/* Borders/Decorations */}
          {selectedTemplate === 'modern' && (
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          )}
          {selectedTemplate === 'sporty' && (
             <>
               <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 transform rotate-45 translate-x-16 -translate-y-16" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 transform rotate-45 -translate-x-16 translate-y-16" />
             </>
          )}

          {/* Content */}
          <div className="flex flex-col items-center justify-center h-full p-12 text-center z-10 relative">
            
            {/* Logo Placeholder */}
            <div className="w-16 h-16 mb-6 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
              🏆
            </div>

            <h1 className={`text-4xl font-bold mb-2 ${selectedTemplate === 'classic' ? 'font-serif text-slate-800' : 'font-sans text-slate-900 tracking-tight'}`}>
              Certificate of Achievement
            </h1>
            
            <p className="text-slate-500 uppercase tracking-widest text-xs font-semibold mb-8">
              PROUDLY PRESENTED TO
            </p>

            <h2 className={`text-5xl mb-6 text-indigo-600 ${selectedTemplate === 'classic' ? 'font-serif italic' : 'font-bold'}`}>
              {recipientName}
            </h2>

            <p className="text-slate-600 text-lg max-w-lg leading-relaxed mb-8">
              For outstanding performance as <strong className="text-slate-900">{achievement}</strong> in the match played on {matchDate}.
            </p>

            {/* Signature Area */}
            <div className="mt-12 flex justify-between w-full max-w-md px-12">
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-2 font-handwriting text-xl text-slate-600 italic">John Smith</div>
                <div className="text-xs text-slate-400 uppercase font-bold">Organizer</div>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-2 font-handwriting text-xl text-slate-600 italic">Play Legends</div>
                <div className="text-xs text-slate-400 uppercase font-bold">Verified By</div>
              </div>
            </div>

            {/* QR Verification Mock */}
            <div className="absolute bottom-6 right-6 opacity-50">
               <div className="w-12 h-12 border border-slate-300 bg-white p-1">
                 <div className="w-full h-full bg-slate-900" />
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
