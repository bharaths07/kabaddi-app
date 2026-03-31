import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { EmptyState } from '@/shared/components/EmptyState';
import { Certificate } from '@/features/certificates/types/certificate';

export const MyCertificatesScreen: React.FC = () => {
  const { currentUser, certificates } = useGlobalState();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // 1. Auth Check (Redirect if Guest)
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Filter Certificates
  const myCertificates = certificates.filter(c => c.playerId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 3. View Logic
  const handlePreview = (cert: Certificate) => {
    setSelectedCertificate(cert);
  };

  const closePreview = () => {
    setSelectedCertificate(null);
  };

  return (
    <div className="max-w-[1000px] mx-auto p-5">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="m-0 text-[#1a237e]">Certificates</h1>
          <p className="mt-1 text-slate-600">
            Official records of your participation and achievements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
            {(currentUser.firstName || currentUser.name || '?').charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.name}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {myCertificates.length === 0 ? (
        <EmptyState
          message="No certificates yet."
          actionLabel="Participate in matches to earn them!"
          icon="📭"
        />
      ) : (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {myCertificates.map(cert => (
            <div
              key={cert.id}
              onClick={() => handlePreview(cert)}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between mb-2.5">
                  <span className="text-2xl">📜</span>
                  <span className="text-[12px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {new Date(cert.date).getFullYear()}
                  </span>
                </div>
                <div className={`text-[11px] uppercase tracking-wide font-bold mb-1 ${cert.type === 'achievement' ? 'text-amber-700' : 'text-blue-700'
                  }`}>
                  {cert.type === 'achievement' ? 'Achievement' : 'Participation'}
                </div>
                <h3 className="m-0 mb-2.5 text-slate-800">{cert.title}</h3>
                <p className="m-0 mb-4 text-slate-600 text-sm">
                  {cert.metadata.matchName}
                </p>
                <div className="text-[12px] text-slate-500 border-t border-slate-100 pt-2.5">
                  <div className="mb-1"><strong>Issuer:</strong> {cert.metadata.organizerName}</div>
                  <div>{cert.metadata.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal (View Only) */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/85 z-[2000] flex justify-center items-center p-5">
          <div className="bg-white p-10 rounded-lg max-w-[800px] w-full max-h-[90vh] overflow-y-auto relative text-center border-[10px] border-slate-300">
            <button
              onClick={closePreview}
              className="absolute top-2.5 right-2.5 bg-transparent border-none text-2xl cursor-pointer text-slate-600"
            >
              ×
            </button>

            <div id="printable-certificate-view">
              <div className="text-5xl mb-5">🏆</div>
              <h1 className="font-serif text-[#1a237e] mb-2.5">{selectedCertificate.title}</h1>
              <p className="text-lg text-slate-600 italic mb-7.5">This certifies that</p>

              <h2 className="text-3xl text-black border-b-2 border-[#1a237e] inline-block pb-2.5 mb-7.5">
                {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.name}
              </h2>

              <p className="text-lg mb-5">{selectedCertificate.description}</p>

              <div className="grid grid-cols-2 gap-5 my-10 text-left bg-slate-50 p-5">
                <div><strong>Match:</strong> {selectedCertificate.metadata.matchName}</div>
                <div><strong>Date:</strong> {new Date(selectedCertificate.date).toLocaleDateString()}</div>
                <div><strong>Sport:</strong> {selectedCertificate.metadata.sportName}</div>
                <div><strong>Location:</strong> {selectedCertificate.metadata.location}</div>
              </div>

              <div className="flex justify-between mt-12.5 pt-5 border-t border-slate-300">
                <div className="text-center">
                  <div className="font-[cursive] text-[20px] mb-1.5">{selectedCertificate.metadata.organizerName}</div>
                  <div className="text-[12px] border-t border-slate-500 pt-1.5 w-[150px] mx-auto">Organizer</div>
                </div>
                <div className="text-center">
                  <div className="font-bold mb-1.5">Play Legends</div>
                  <div className="text-[12px] text-slate-500">Generated by Play Legends</div>
                </div>
              </div>
            </div>

            <div className="mt-7.5 flex gap-2.5 justify-center">
              <button
                onClick={closePreview}
                className="px-6 py-3 bg-slate-200 text-slate-800 border-none rounded cursor-pointer text-base hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
