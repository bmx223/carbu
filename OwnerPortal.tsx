
import React, { useState, useRef, useMemo } from 'react';
import { Station, Commune, StationStatus, QueueLength, FuelType } from './types';
import { BuildingStorefrontIcon, ClockIcon, KeyIcon, PencilSquareIcon, PlusCircleIcon } from './components/icons';

interface OwnerPortalProps {
    station?: Station;
    communes: Commune[];
    onClose: () => void;
    onUpdateStatus: (stationId: number, newStatus: Partial<Station>) => void;
    onSubmitForReview: (data: any) => void;
}

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "à l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days} j`;
};


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
    return [formState, handleChange, setFormState];
};

const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
    const steps = [
        { num: 1, title: "Infos" },
        { num: 2, title: "Lieu" },
        { num: 3, title: "Carburants" },
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.num}>
                        <div className="flex flex-col items-center text-center w-16">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${currentStep >= step.num ? 'bg-mali-green text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {currentStep > step.num ? '✓' : step.num}
                            </div>
                            <p className={`mt-2 text-sm font-semibold ${currentStep >= step.num ? 'text-gray-800' : 'text-gray-500'}`}>{step.title}</p>
                        </div>
                        {index < totalSteps - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${currentStep > index + 1 ? 'bg-mali-green' : 'bg-gray-200'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export const OwnerPortal: React.FC<OwnerPortalProps> = ({ station, communes, onClose, onUpdateStatus, onSubmitForReview }) => {
    const isEditMode = !!station;
    const [step, setStep] = useState(1);
    const formRef = useRef<HTMLFormElement>(null);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    
    const initialInfoState = useMemo(() => isEditMode ? {
        name: station.name,
        address: station.address,
        communeId: station.communeId,
        location: { lat: station.location.lat, lon: station.location.lon },
        fuelAvailability: { ...station.fuelAvailability },
        imageUrl: station.imageUrl,
    } : {
        name: '',
        address: '',
        communeId: communes.length > 0 ? communes[0].id : 1,
        location: { lat: 12.6392, lon: -8.0029 }, // Default to Bamako center
        fuelAvailability: {},
        imageUrl: undefined,
    }, [station, isEditMode, communes]);

    const [infoChanges, handleInfoChange, setInfoChanges] = useFormState(initialInfoState);
    const [imagePreview, setImagePreview] = useState<string | null>(isEditMode ? station.imageUrl || null : null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                handleInfoChange({ target: { name: 'imageUrl', value: result, type: 'text' } } as any);
            };
            // Fix: Corrected FileReader method from readDataURL to readAsDataURL.
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveImage = () => {
        setImagePreview(null);
        handleInfoChange({ target: { name: 'imageUrl', value: undefined, type: 'text' } } as any);
    }
    
    const handleAddStationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = formRef.current;
        if (!form) return;

        const currentStepContainer = form.querySelector(`[data-step="${step}"]`);
        if (currentStepContainer) {
            const inputs = Array.from(
                currentStepContainer.querySelectorAll('input[required], select[required]')
            ) as (HTMLInputElement | HTMLSelectElement)[];

            for (const input of inputs) {
                if (!input.checkValidity()) {
                    input.reportValidity();
                    return;
                }
            }
        }

        if (step === 3) {
            onSubmitForReview(infoChanges);
        } else {
            setStep(s => Math.min(s + 1, 3));
        }
    };

    const handleEditDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitForReview(infoChanges);
    };

    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleFuelUpdate = (fuel: FuelType, available: boolean) => {
        if (!station) return;
        
        const newFuelAvailability = {
            ...station.fuelAvailability,
            [fuel]: available,
        };

        const isAnyFuelAvailable = Object.values(newFuelAvailability).some(v => v);
        const newStatus = isAnyFuelAvailable ? StationStatus.AVAILABLE : StationStatus.UNAVAILABLE;

        onUpdateStatus(station.id, {
            fuelAvailability: newFuelAvailability,
            status: newStatus,
        });
    };
    
    const handleQueueUpdate = (queue: QueueLength) => {
        if (!station) return;
        const queueSizeMap: { [key in QueueLength]?: number | null } = {
            [QueueLength.SHORT]: 10,
            [QueueLength.MEDIUM]: 40,
            [QueueLength.LONG]: 75,
            [QueueLength.NONE]: 0,
        };
        onUpdateStatus(station.id, { queue, queueSize: queueSizeMap[queue] });
    };

    const allFuelTypes = Object.values(FuelType);

    const renderAddStationForm = () => (
        <form ref={formRef} onSubmit={handleAddStationSubmit} className="flex flex-col h-full" noValidate>
            <div className="flex-grow p-6">
                <ProgressBar currentStep={step} totalSteps={3} />
                {step === 1 && (
                    <div data-step="1" className="space-y-5 animate-fade-in-up">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Nom de la station <span className="text-mali-red">*</span></label>
                            <input type="text" name="name" id="name" value={infoChanges.name} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-1">Adresse <span className="text-mali-red">*</span></label>
                            <input type="text" name="address" id="address" value={infoChanges.address} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div data-step="2" className="space-y-5 animate-fade-in-up">
                         <div>
                            <label htmlFor="communeId" className="block text-sm font-bold text-gray-700 mb-1">Commune <span className="text-mali-red">*</span></label>
                            <select name="communeId" id="communeId" value={infoChanges.communeId} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white" required>
                                {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="lat" className="block text-sm font-bold text-gray-700 mb-1">Latitude <span className="text-mali-red">*</span></label>
                                <input type="number" step="any" name="location.lat" id="lat" value={infoChanges.location.lat} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                            </div>
                             <div>
                                <label htmlFor="lon" className="block text-sm font-bold text-gray-700 mb-1">Longitude <span className="text-mali-red">*</span></label>
                                <input type="number" step="any" name="location.lon" id="lon" value={infoChanges.location.lon} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Photo de la station</label>
                            <div className="mt-1 flex items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Aperçu" className="w-24 h-24 rounded-lg object-cover" />
                                        <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">&times;</button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <PlusCircleIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mali-green file:text-white hover:file:bg-green-700"/>
                            </div>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div data-step="3" className="space-y-4 animate-fade-in-up">
                        <h4 className="font-bold text-gray-800">Carburants Disponibles</h4>
                        {allFuelTypes.map(fuel => (
                            <label key={fuel} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                <input type="checkbox" name={`fuelAvailability.${fuel}`} checked={!!infoChanges.fuelAvailability[fuel]} onChange={handleInfoChange} className="h-5 w-5 rounded border-gray-300 text-mali-green focus:ring-mali-green"/>
                                <span className="font-semibold text-gray-700">{fuel}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            <footer className="p-4 border-t bg-white sticky bottom-0 z-10">
                <div className="flex justify-between">
                    <button type="button" onClick={step === 1 ? onClose : handlePrev} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                        {step === 1 ? 'Annuler' : 'Précédent'}
                    </button>
                    <button type="submit" className="bg-mali-green text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                        {step < 3 ? 'Suivant' : 'Soumettre pour Validation Admin'}
                    </button>
                </div>
            </footer>
        </form>
    );

    const renderEditDetailsForm = () => {
        if (!station) return null;
        return (
             <form onSubmit={handleEditDetailsSubmit} className="flex flex-col h-full" noValidate>
                 <header className="p-4 border-b bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-800">Modifier les informations</h3>
                    <p className="text-sm text-gray-500">Les changements seront soumis à validation.</p>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Nom de la station <span className="text-mali-red">*</span></label>
                            <input type="text" name="name" id="name" value={infoChanges.name} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-1">Adresse <span className="text-mali-red">*</span></label>
                            <input type="text" name="address" id="address" value={infoChanges.address} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Photo de la station</label>
                            <div className="mt-1 flex items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Aperçu" className="w-24 h-24 rounded-lg object-cover" />
                                        <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">&times;</button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <PlusCircleIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mali-green file:text-white hover:file:bg-green-700"/>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t bg-white sticky bottom-0 z-10 flex justify-between">
                    <button type="button" onClick={() => setIsEditingDetails(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                        Retour
                    </button>
                    <button type="submit" className="bg-mali-green text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                        Soumettre les modifications
                    </button>
                </footer>
            </form>
        );
    };

    const renderQuickUpdateDashboard = () => {
        if (!station) return null;

        const globalStatus = station.status === StationStatus.AVAILABLE ? 'Disponible' : 'Rupture de stock';
        const globalStatusColor = station.status === StationStatus.AVAILABLE ? 'text-green-600' : 'text-red-600';
        
        const queueConfig = {
            [QueueLength.SHORT]: { label: 'Courte', sub: '(~10 pers.)', color: 'green' },
            [QueueLength.MEDIUM]: { label: 'Moyenne', sub: '(~40 pers.)', color: 'yellow' },
            [QueueLength.LONG]: { label: 'Longue', sub: '(~75+ pers.)', color: 'red' },
            [QueueLength.NONE]: { label: 'Aucune', sub: '(ou Fermée)', color: 'gray' },
        };

        return (
            <div className="flex flex-col h-full">
                <header className="p-4 border-b bg-white sticky top-0 z-10 flex justify-between items-center">
                     <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                           <KeyIcon className="w-6 h-6 text-yellow-500"/>
                           <span>Mise à Jour Rapide</span>
                        </h2>
                     </div>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </header>
                <main className="flex-grow p-4 sm:p-6 space-y-6 overflow-y-auto bg-gray-50">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <BuildingStorefrontIcon className="w-8 h-8 text-gray-500 shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{station.name}</h3>
                                    <p className="text-sm text-gray-500">{station.address}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Statut global :</span>
                                    <span className={`font-bold ${globalStatusColor}`}>{globalStatus}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <ClockIcon className="w-4 h-4"/>
                                    <span>Dernière MàJ : {formatTimeAgo(station.lastUpdate)}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setInfoChanges(initialInfoState);
                                setImagePreview(station.imageUrl || null);
                                setIsEditingDetails(true);
                            }} 
                            className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Modifier Infos</span>
                        </button>
                    </div>
                    
                    {/* Fuel Stock */}
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-3">Stocks Carburant</h4>
                        <div className="space-y-3">
                            {allFuelTypes.map(fuel => {
                                const isAvailable = station.fuelAvailability?.[fuel] ?? false;
                                return (
                                    <div key={fuel}>
                                        <label className="block text-sm font-medium text-gray-600 mb-1.5">{fuel}</label>
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            <button 
                                                onClick={() => handleFuelUpdate(fuel, true)}
                                                className={`w-1/2 py-2.5 px-4 text-sm rounded-md font-bold transition-all duration-200 ${isAvailable ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                                            >DISPONIBLE</button>
                                            <button 
                                                onClick={() => handleFuelUpdate(fuel, false)}
                                                className={`w-1/2 py-2.5 px-4 text-sm rounded-md font-bold transition-all duration-200 ${!isAvailable ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                                            >RUPTURE</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Queue */}
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-3">File d'attente</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(queueConfig).map(([key, config]) => {
                                const queueKey = key as QueueLength;
                                const isActive = station.queue === queueKey;
                                const activeClasses = {
                                    green: 'bg-green-100 text-green-800 ring-2 ring-green-500',
                                    yellow: 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500',
                                    red: 'bg-red-100 text-red-800 ring-2 ring-red-500',
                                    gray: 'bg-gray-200 text-gray-800 ring-2 ring-gray-400',
                                };
                                const inactiveClasses = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
                                
                                return (
                                    <button 
                                        key={key}
                                        onClick={() => handleQueueUpdate(queueKey)}
                                        className={`p-3 rounded-lg font-bold transition-all text-center ${isActive ? activeClasses[config.color] : inactiveClasses}`}
                                    >
                                        {config.label}
                                        <span className="block text-xs font-normal opacity-80">{config.sub}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300" onMouseDown={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up" onMouseDown={e => e.stopPropagation()}>
                {isEditMode ? 
                    (isEditingDetails ? renderEditDetailsForm() : renderQuickUpdateDashboard()) 
                    : (
                        <>
                            <header className="p-4 border-b bg-white sticky top-0 z-10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <PlusCircleIcon className="w-6 h-6 text-mali-green" />
                                        <span>Ajouter une station</span>
                                    </h2>
                                    <p className="text-sm text-gray-500">Suivez les étapes pour enregistrer votre station.</p>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                            </header>
                            <div className="overflow-y-auto">
                               {renderAddStationForm()}
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
};
