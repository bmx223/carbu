import React, { useState } from 'react';
import { Station, Commune, StationStatus, QueueLength, FuelType } from './types';
import { CheckBadgeIcon, ClockIcon, KeyIcon, MapPinIcon } from './components/icons';

interface OwnerPortalProps {
    station: Station;
    communes: Commune[];
    onClose: () => void;
    onUpdateStatus: (stationId: number, newStatus: Partial<Station>) => void;
    onSubmitForReview: (stationId: number, changes: any) => void;
}

// Custom hook for form state
const useFormState = (initialState: any) => {
    const [formState, setFormState] = useState(initialState);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            const [field, key] = name.split('.');
            setFormState((prevState: any) => ({
                ...prevState,
                [field]: {
                    ...prevState[field],
                    [key]: checked,
                },
            }));
        } else if (name.includes('.')) {
            const [field, key] = name.split('.');
             setFormState((prevState: any) => ({
                ...prevState,
                [field]: {
                    ...prevState[field],
                    [key]: value,
                },
            }));
        }
        else {
            setFormState((prevState: any) => ({ ...prevState, [name]: value }));
        }
    };
    return [formState, handleChange];
};

export const OwnerPortal: React.FC<OwnerPortalProps> = ({ station, communes, onClose, onUpdateStatus, onSubmitForReview }) => {
    
    const [liveStatus, handleLiveStatusChange] = useFormState({
        status: station.status,
        queue: station.queue,
        queueSize: station.queueSize || '',
    });

    const [infoChanges, handleInfoChange] = useFormState({
        name: station.name,
        address: station.address,
        communeId: station.communeId,
        location: { lat: station.location.lat, lon: station.location.lon },
        fuelAvailability: { ...station.fuelAvailability },
        imageUrl: station.imageUrl,
    });
    
    const [imagePreview, setImagePreview] = useState<string | null>(station.imageUrl || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                // Manually trigger useFormState update for nested imageUrl
                handleInfoChange({ target: { name: 'imageUrl', value: result, type: 'text' } } as any);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveImage = () => {
        setImagePreview(null);
        handleInfoChange({ target: { name: 'imageUrl', value: undefined, type: 'text' } } as any);
    }

    const handleLiveUpdate = () => {
        const updates: Partial<Station> = {
            status: liveStatus.status,
            queue: liveStatus.queue,
            queueSize: liveStatus.queueSize ? parseInt(liveStatus.queueSize, 10) : null,
        };
        onUpdateStatus(station.id, updates);
    };
    
    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitForReview(station.id, infoChanges);
    };

    const allFuelTypes = Object.values(FuelType);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300" onMouseDown={onClose}>
            <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up" onMouseDown={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <KeyIcon className="w-6 h-6 text-yellow-500" />
                            <span>Espace Propriétaire: {station.name}</span>
                        </h2>
                        <p className="text-sm text-gray-500">Gérez les informations de votre station.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </header>

                <main className="overflow-y-auto p-6 space-y-6">
                    {/* Section 1: Live Updates */}
                    <div className="bg-white p-5 rounded-xl shadow-md border">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-mali-green"/>
                            Mise à Jour en Temps Réel
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Ces changements sont appliqués immédiatement.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                <select name="status" value={liveStatus.status} onChange={handleLiveStatusChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-green focus:border-mali-green">
                                    {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File d'attente</label>
                                <select name="queue" value={liveStatus.queue} onChange={handleLiveStatusChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-green focus:border-mali-green">
                                    {Object.values(QueueLength).map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Taille file (estimé)</label>
                                <input type="number" name="queueSize" value={liveStatus.queueSize} onChange={handleLiveStatusChange} placeholder="ex: 25" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-mali-green focus:border-mali-green" />
                            </div>
                        </div>
                        <div className="mt-4 text-right">
                            <button onClick={handleLiveUpdate} className="bg-mali-green text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors">
                                Mettre à jour le statut
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Info Changes for Review */}
                    <form onSubmit={handleReviewSubmit} className="bg-white p-5 rounded-xl shadow-md border">
                         <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CheckBadgeIcon className="w-5 h-5 text-blue-500"/>
                            Demande de Modification des Informations
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Ces changements nécessitent une validation de notre part.</p>
                        
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'enseigne</label>
                                    <input type="text" name="name" value={infoChanges.name} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                                    <select name="communeId" value={infoChanges.communeId} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500">
                                        {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse physique</label>
                                <input type="text" name="address" value={infoChanges.address} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (GPS)</label>
                                    <input type="number" step="any" name="location.lat" value={infoChanges.location.lat} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (GPS)</label>
                                    <input type="number" step="any" name="location.lon" value={infoChanges.location.lon} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Carburants vendus</label>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                                    {allFuelTypes.map(fuel => (
                                        <label key={fuel} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                name={`fuelAvailability.${fuel}`}
                                                checked={!!infoChanges.fuelAvailability[fuel]}
                                                onChange={handleInfoChange}
                                                className="h-4 w-4 rounded border-gray-300 text-mali-green focus:ring-mali-green"
                                            />
                                            {fuel}
                                        </label>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image de la station</label>
                                <div className="mt-2 flex items-center gap-4">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Aperçu" className="w-20 h-20 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border">
                                            <MapPinIcon className="w-8 h-8"/>
                                        </div>
                                    )}
                                    <div className='flex flex-col gap-2'>
                                        <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        <label htmlFor="imageUpload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                            Changer l'image
                                        </label>
                                        {imagePreview && <button type="button" onClick={handleRemoveImage} className="text-red-600 text-sm hover:underline text-left">Supprimer</button>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                             <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">
                                Soumettre pour validation
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};
