import React, { useState, FormEvent } from 'react';
import { Station, IncidentReport, IncidentType } from '../types';
import { FlagIcon } from './icons';
import { ConfirmationDialog } from './ConfirmationDialog';

interface IncidentReportModalProps {
    stations: Station[];
    onClose: () => void;
    onSubmit: (report: Omit<IncidentReport, 'id' | 'reportedAt'>) => void;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({ stations, onClose, onSubmit }) => {
    const [stationId, setStationId] = useState<string>('');
    const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.ABUSE);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [reportToConfirm, setReportToConfirm] = useState<Omit<IncidentReport, 'id' | 'reportedAt'> | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!stationId) {
            setError("Veuillez sélectionner une station.");
            return;
        }

        const reportData: Omit<IncidentReport, 'id' | 'reportedAt'> = {
            stationId: parseInt(stationId, 10),
            incidentType,
            description,
        };
        
        setReportToConfirm(reportData);
        setIsConfirming(true);
    };

    const handleConfirmSubmit = () => {
        if (reportToConfirm) {
            onSubmit(reportToConfirm);
        }
        setIsConfirming(false);
        setReportToConfirm(null);
    };

    const sortedStations = [...stations].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300" onMouseDown={onClose}>
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up"
                    onMouseDown={e => e.stopPropagation()}
                    noValidate
                >
                    <header className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FlagIcon className="w-6 h-6 text-mali-red" />
                                <span>Signaler un Incident</span>
                            </h2>
                            <p className="text-sm text-gray-500">Aidez la communauté en signalant les problèmes.</p>
                        </div>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                    </header>

                    <main className="overflow-y-auto p-6 space-y-5">
                        <div>
                            <label htmlFor="stationId" className="block text-sm font-bold text-gray-700 mb-1">Station concernée <span className="text-mali-red">*</span></label>
                            <select
                                id="stationId"
                                value={stationId}
                                onChange={e => setStationId(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-red focus:border-mali-red text-base text-gray-900"
                            >
                                <option value="" disabled>Sélectionnez une station</option>
                                {sortedStations.map(s => <option key={s.id} value={s.id}>{s.name} - {s.communeName}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="incidentType" className="block text-sm font-bold text-gray-700 mb-1">Type d'incident <span className="text-mali-red">*</span></label>
                            <select
                                id="incidentType"
                                value={incidentType}
                                onChange={e => setIncidentType(e.target.value as IncidentType)}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-red focus:border-mali-red text-base text-gray-900"
                            >
                                {Object.values(IncidentType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Description (optionnel)</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Décrivez brièvement ce qui s'est passé."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-mali-red focus:border-mali-red text-base text-gray-900"
                            ></textarea>
                        </div>
                    </main>

                    <footer className="p-4 border-t bg-white rounded-b-2xl sticky bottom-0 z-10">
                        {error && <p className="text-sm text-mali-red mb-3 text-center">{error}</p>}
                        <button type="submit" className="w-full bg-mali-red text-white font-bold py-3 px-5 rounded-lg hover:bg-red-700 transition-colors">
                            Envoyer le signalement
                        </button>
                    </footer>
                </form>
            </div>
            {isConfirming && reportToConfirm && (
                <ConfirmationDialog
                    isOpen={isConfirming}
                    onClose={() => setIsConfirming(false)}
                    onConfirm={handleConfirmSubmit}
                    title="Confirmer le Signalement"
                    confirmText="Oui, envoyer"
                >
                    <p>Veuillez vérifier les informations avant de soumettre :</p>
                    <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                        <li>
                            <strong>Station :</strong> {stations.find(s => s.id === reportToConfirm.stationId)?.name}
                        </li>
                        <li>
                            <strong>Type d'incident :</strong> {reportToConfirm.incidentType}
                        </li>
                    </ul>
                </ConfirmationDialog>
            )}
        </>
    );
};
