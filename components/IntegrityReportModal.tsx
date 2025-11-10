import React, { useState, FormEvent } from 'react';
import { Station, IntegrityReport, FraudType } from '../types';
import { ShieldCheckIcon } from './icons';
import { ConfirmationDialog } from './ConfirmationDialog';

interface IntegrityReportModalProps {
    stations: Station[];
    onClose: () => void;
    onSubmit: (report: Omit<IntegrityReport, 'id' | 'reportedAt'>) => void;
}

export const IntegrityReportModal: React.FC<IntegrityReportModalProps> = ({ stations, onClose, onSubmit }) => {
    const [stationId, setStationId] = useState<string>('');
    const [fraudTypes, setFraudTypes] = useState<{ [key: string]: boolean }>({});
    const [otherFraudDescription, setOtherFraudDescription] = useState('');
    const [observationDateTime, setObservationDateTime] = useState('');
    const [description, setDescription] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [contactInfo, setContactInfo] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [reportToConfirm, setReportToConfirm] = useState<Omit<IntegrityReport, 'id' | 'reportedAt'> | null>(null);

    const handleFraudTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFraudTypes(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!stationId) {
            setError("Veuillez sélectionner une station.");
            return;
        }
        const selectedFraudTypes = Object.keys(fraudTypes).filter(key => fraudTypes[key]);
        if (selectedFraudTypes.length === 0) {
            setError("Veuillez sélectionner au moins un type de fraude.");
            return;
        }
        if (fraudTypes[FraudType.OTHER] && !otherFraudDescription.trim()) {
            setError("Veuillez préciser le type de fraude dans le champ 'Autres'.");
            return;
        }
        if (!observationDateTime) {
            setError("Veuillez spécifier la date et l'heure de l'observation.");
            return;
        }
        if (!description.trim()) {
            setError("Veuillez fournir une description de l'événement.");
            return;
        }
        if (!isAnonymous && !contactInfo.trim()) {
            setError("Veuillez fournir vos informations de contact ou choisir le signalement anonyme.");
            return;
        }
        
        const reportData: Omit<IntegrityReport, 'id' | 'reportedAt'> = {
            stationId: parseInt(stationId, 10),
            fraudTypes,
            otherFraudDescription: fraudTypes[FraudType.OTHER] ? otherFraudDescription : undefined,
            observationDateTime,
            description,
            isAnonymous,
            contactInfo: isAnonymous ? undefined : contactInfo,
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
    const allFraudTypes = Object.values(FraudType);
    const CHARACTER_LIMIT = 500;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300" onMouseDown={onClose}>
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
                    onMouseDown={e => e.stopPropagation()}
                    noValidate
                >
                    <header className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ShieldCheckIcon className="w-6 h-6 text-mali-red" />
                                <span>Alerte Intégrité</span>
                            </h2>
                            <p className="text-sm text-gray-500">Signaler une fraude de manière sécurisée.</p>
                        </div>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                    </header>

                    <main className="overflow-y-auto p-6 space-y-5">
                        {/* Station */}
                        <div>
                            <label htmlFor="stationId" className="block text-sm font-bold text-gray-700 mb-1">Nom/Lieu de la station <span className="text-mali-red">*</span></label>
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
                        
                        {/* Fraud Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Type de fraude <span className="text-mali-red">*</span></label>
                            <div className="space-y-2">
                                {allFraudTypes.map(type => (
                                    <div key={type}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={type}
                                                checked={!!fraudTypes[type]}
                                                onChange={handleFraudTypeChange}
                                                className="h-4 w-4 rounded border-gray-300 text-mali-red focus:ring-mali-red"
                                            />
                                            <span className="text-gray-800">{type}</span>
                                        </label>
                                        {type === FraudType.OTHER && fraudTypes[FraudType.OTHER] && (
                                            <input
                                                type="text"
                                                value={otherFraudDescription}
                                                onChange={e => setOtherFraudDescription(e.target.value)}
                                                placeholder="Veuillez préciser"
                                                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-mali-red focus:border-mali-red text-base text-gray-900"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Date and Time */}
                        <div>
                            <label htmlFor="observationDateTime" className="block text-sm font-bold text-gray-700 mb-1">Date et Heure de l'observation <span className="text-mali-red">*</span></label>
                            <input
                                type="datetime-local"
                                id="observationDateTime"
                                value={observationDateTime}
                                onChange={e => setObservationDateTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-red focus:border-mali-red text-base text-gray-900"
                            />
                        </div>
                        
                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Description de l'événement <span className="text-mali-red">*</span></label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                maxLength={CHARACTER_LIMIT}
                                rows={4}
                                placeholder="Décrivez ce que vous avez observé avec le plus de détails possible."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-mali-red focus:border-mali-red text-base text-gray-900"
                            ></textarea>
                            <p className="text-right text-xs text-gray-500 mt-1">{description.length}/{CHARACTER_LIMIT}</p>
                        </div>

                        {/* Confidentiality */}
                        <div className="border-t pt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Confidentialité</label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-white border rounded-lg has-[:checked]:border-mali-red has-[:checked]:bg-red-50">
                                    <input type="radio" name="confidentiality" checked={isAnonymous} onChange={() => setIsAnonymous(true)} className="h-4 w-4 text-mali-red focus:ring-mali-red"/>
                                    <div>
                                        <p className="font-semibold text-gray-800">Signalement Anonyme (par défaut)</p>
                                        <p className="text-xs text-gray-500">Votre identité ne sera pas partagée.</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-white border rounded-lg has-[:checked]:border-mali-red has-[:checked]:bg-red-50">
                                    <input type="radio" name="confidentiality" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} className="h-4 w-4 text-mali-red focus:ring-mali-red"/>
                                    <div>
                                        <p className="font-semibold text-gray-800">J'accepte d'être contacté par les autorités</p>
                                        <p className="text-xs text-gray-500">Uniquement pour les besoins de l'enquête.</p>
                                    </div>
                                </label>
                            </div>
                            {!isAnonymous && (
                                <div className="mt-3">
                                    <label htmlFor="contactInfo" className="block text-sm font-bold text-gray-700 mb-1">Numéro de téléphone ou Email <span className="text-mali-red">*</span></label>
                                    <input
                                        type="text"
                                        id="contactInfo"
                                        value={contactInfo}
                                        onChange={e => setContactInfo(e.target.value)}
                                        placeholder="Ex: 77123456 ou mon.email@example.com"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-mali-red focus:border-mali-red text-base text-gray-900"
                                    />
                                </div>
                            )}
                        </div>
                    </main>

                    <footer className="p-4 border-t bg-white rounded-b-2xl sticky bottom-0 z-10">
                        {error && <p className="text-sm text-mali-red mb-3 text-center">{error}</p>}
                        <button type="submit" className="w-full bg-mali-red text-white font-bold py-3 px-5 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">
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
                            <strong>Types de fraude :</strong> {Object.entries(reportToConfirm.fraudTypes).filter(([, val]) => val).map(([key]) => key).join(', ')}
                        </li>
                        <li>
                            <strong>Date :</strong> {new Date(reportToConfirm.observationDateTime).toLocaleString('fr-FR')}
                        </li>
                        <li>
                            <strong>Signalement :</strong> {reportToConfirm.isAnonymous ? 'Anonyme' : 'Non-anonyme'}
                        </li>
                    </ul>
                </ConfirmationDialog>
            )}
        </>
    );
};
