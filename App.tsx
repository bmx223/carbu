

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Station, StationStatus, QueueLength, FuelType, Report, Commune, IncidentType, IncidentReport, IntegrityReport } from './types';
import { analyzeFuelTrends } from './services/geminiService';
import { LogoIcon, PlusCircleIcon, KeyIcon, UserShieldIcon, ArrowRightOnRectangleIcon } from './components/icons';
import { Dashboard } from './components/Dashboard';
import { MapView } from './components/MapView';
import { StationList } from './components/StationList';
import { IntegrityReportModal } from './components/IntegrityReportModal';
import { IncidentReportModal } from './components/IncidentReportModal';
import { OwnerPortal } from "./OwnerPortal";
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginModal } from './components/AdminLoginModal';

// Mock Data
const communes: Commune[] = [
    { id: 1, name: 'Commune I' }, { id: 2, name: 'Commune II' }, { id: 3, name: 'Commune III' },
    { id: 4, name: 'Commune IV' }, { id: 5, name: 'Commune V' }, { id: 6, name: 'Commune VI' },
    { id: 7, name: 'Kalaban Coro' }, { id: 8, name: 'Kati' },
];
const initialStations: Station[] = [
  { id: 1, name: 'TotalEnergies ACI 2000', address: 'ACI 2000, Bamako', communeId: 4, communeName: 'Commune IV', location: { lat: 12.63, lon: -8.03 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 10, lastUpdate: new Date(Date.now() - 15 * 60 * 1000), verified: true, imageUrl: 'https://pbs.twimg.com/media/FGo9n26XEAQiybC.jpg' },
  { id: 2, name: 'Shell Badalabougou', address: 'Badalabougou, Bamako', communeId: 5, communeName: 'Commune V', location: { lat: 12.62, lon: -7.99 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: false }, queue: QueueLength.LONG, queueSize: 75, lastUpdate: new Date(Date.now() - 5 * 60 * 1000), imageUrl: 'https://fastly.4sqi.net/img/general/600x600/39369904_Jz7r13i2iO90J3b62l2c-4DV92YODEn-hs-NVT6rqiA.jpg', verified: true },
  { id: 3, name: 'Oryx Hippodrome', address: 'Hippodrome, Bamako', communeId: 2, communeName: 'Commune II', location: { lat: 12.64, lon: -8.01 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, queueSize: 0, lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000), verified: true },
  { id: 4, name: 'Star Oil Sotuba', address: 'Sotuba, Bamako', communeId: 1, communeName: 'Commune I', location: { lat: 12.65, lon: -7.95 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true, [FuelType.KEROSENE]: true }, queue: QueueLength.MEDIUM, queueSize: 30, lastUpdate: new Date(Date.now() - 7 * 60 * 60 * 1000), verified: false },
  { id: 5, name: 'BNDA Station Cité du Niger', address: 'Cité du Niger, Bamako', communeId: 1, communeName: 'Commune I', location: { lat: 12.66, lon: -8.02 }, status: StationStatus.CLOSED, fuelAvailability: {}, queue: QueueLength.NONE, queueSize: 0, lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000), verified: true },
  { id: 6, name: 'Total Médina Coura', address: 'Médina Coura, Bamako', communeId: 2, communeName: 'Commune II', location: { lat: 12.6398, lon: -8.0021 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 25, lastUpdate: new Date(Date.now() - 25 * 60 * 1000), verified: true },
  { id: 7, name: 'Shell Faladié', address: 'Faladié, Bamako', communeId: 6, communeName: 'Commune VI', location: { lat: 12.59, lon: -7.95 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000), verified: true },
  { id: 8, name: 'Total Niamakoro', address: 'Niamakoro, Bamako', communeId: 6, communeName: 'Commune VI', location: { lat: 12.58, lon: -7.97 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 5, lastUpdate: new Date(Date.now() - 45 * 60 * 1000), verified: true },
  { id: 9, name: 'Oryx Magnambougou', address: 'Magnambougou, Bamako', communeId: 6, communeName: 'Commune VI', location: { lat: 12.61, lon: -7.93 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 40, lastUpdate: new Date(Date.now() - 10 * 60 * 1000), verified: true },
  { id: 10, name: 'Star Oil Lafiabougou', address: 'Lafiabougou, Bamako', communeId: 4, communeName: 'Commune IV', location: { lat: 12.62, lon: -8.04 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date(Date.now() - 3 * 60 * 60 * 1000), verified: true },
  // --- NOUVELLES STATIONS ---
  // COMMUNE I
  { id: 11, name: 'Sygim énergie Boulkassoumbougou', address: 'Face à l\'hôtel montana', communeId: 1, communeName: 'Commune I', location: { lat: 12.65, lon: -7.98 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 60, lastUpdate: new Date(), verified: true },
  { id: 12, name: 'Sygim énergie Sotuba', address: 'Près de Sotelco', communeId: 1, communeName: 'Commune I', location: { lat: 12.66, lon: -7.94 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 80, lastUpdate: new Date(), verified: true },
  { id: 13, name: 'NDC Sotuba', address: 'Face cimetière', communeId: 1, communeName: 'Commune I', location: { lat: 12.655, lon: -7.955 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.MEDIUM, queueSize: 20, lastUpdate: new Date(), verified: true },
  // COMMUNE II
  { id: 14, name: 'Pretromali Hippodrome II', address: 'Hippodrome II', communeId: 2, communeName: 'Commune II', location: { lat: 12.645, lon: -8.015 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 15, lastUpdate: new Date(), verified: true },
  { id: 15, name: 'Somayaf Zone Industrielle', address: 'Zone Industrielle et Bougouba', communeId: 2, communeName: 'Commune II', location: { lat: 12.63, lon: -8.00 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.LONG, queueSize: 55, lastUpdate: new Date(), verified: true },
  // COMMUNE IV
  { id: 16, name: 'Holding Service Sebenicoro', address: 'Sebenicoro', communeId: 4, communeName: 'Commune IV', location: { lat: 12.66, lon: -8.04 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 70, lastUpdate: new Date(), verified: true },
  { id: 17, name: 'Station Baraka Hamdallaye ACI', address: 'Hamdallaye ACI', communeId: 4, communeName: 'Commune IV', location: { lat: 12.64, lon: -8.03 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, lastUpdate: new Date(), verified: true },
  // COMMUNE V
  { id: 18, name: 'Nietao Bacodjicoroni', address: 'Bacodjicoroni', communeId: 5, communeName: 'Commune V', location: { lat: 12.61, lon: -7.98 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.MEDIUM, queueSize: 35, lastUpdate: new Date(), verified: true },
  { id: 19, name: 'Corridor vers lycée Kankou Moussa', address: 'Près du lycée Kankou Moussa', communeId: 5, communeName: 'Commune V', location: { lat: 12.615, lon: -7.985 }, status: StationStatus.CLOSED, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date(), verified: true },
  { id: 20, name: 'Holdings services Badalabougou', address: 'Badalabougou', communeId: 5, communeName: 'Commune V', location: { lat: 12.625, lon: -7.995 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 8, lastUpdate: new Date(), verified: true },
];

const mockIncidents: IncidentReport[] = [
    { id: 1, stationId: 2, incidentType: IncidentType.ABUSE, description: "Le pompiste sert ses amis en priorité.", reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 2, stationId: 7, incidentType: IncidentType.BLACK_MARKET, description: "Vente d'essence dans des bidons à prix d'or juste à côté.", reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 3, stationId: 15, incidentType: IncidentType.DISPUTE, description: "Altercation entre plusieurs automobilistes.", reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }
];

type View = 'dashboard' | 'map' | 'list' | 'admin';

const MobileMenu: React.FC<{
    onClose: () => void;
    onNavigate: (view: View) => void;
    onOpenOwnerPortal: () => void;
    onAdminClick: () => void;
    onAdminLogout: () => void;
    isAdminAuthenticated: boolean;
}> = ({ onClose, onNavigate, onOpenOwnerPortal, onAdminClick, onAdminLogout, isAdminAuthenticated }) => {
    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
            <div className="fixed top-0 right-0 bottom-0 bg-white w-full max-w-xs p-6 shadow-xl animate-fade-in-right">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>
                <nav className="flex flex-col space-y-4">
                    <button onClick={() => onNavigate('dashboard')} className="text-left text-lg font-semibold text-gray-700 hover:text-mali-green p-2 rounded-lg transition-colors">Tableau de Bord</button>
                    <button onClick={() => onNavigate('map')} className="text-left text-lg font-semibold text-gray-700 hover:text-mali-green p-2 rounded-lg transition-colors">Carte</button>
                    <button onClick={() => onNavigate('list')} className="text-left text-lg font-semibold text-gray-700 hover:text-mali-green p-2 rounded-lg transition-colors">Liste des Stations</button>
                    <div className="pt-4 border-t border-gray-200"></div>
                    <button
                        onClick={onOpenOwnerPortal}
                        className="flex items-center gap-3 text-left text-lg font-semibold text-yellow-800 bg-yellow-300 p-3 rounded-lg transition-colors hover:bg-yellow-400"
                    >
                        <KeyIcon className="w-6 h-6"/>
                        Espace Propriétaire
                    </button>
                    {isAdminAuthenticated ? (
                        <>
                            <button
                                onClick={() => onNavigate('admin')}
                                className="flex items-center gap-3 text-left text-lg font-semibold text-blue-800 bg-blue-200 p-3 rounded-lg transition-colors hover:bg-blue-300"
                            >
                                <UserShieldIcon className="w-6 h-6"/>
                                Portail Admin
                            </button>
                             <button
                                onClick={onAdminLogout}
                                className="flex items-center gap-3 text-left text-lg font-semibold text-red-800 bg-red-100 p-3 rounded-lg transition-colors hover:bg-red-200"
                            >
                                <ArrowRightOnRectangleIcon className="w-6 h-6"/>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onAdminClick}
                            className="flex items-center gap-3 text-left text-lg font-semibold text-blue-800 bg-blue-200 p-3 rounded-lg transition-colors hover:bg-blue-300"
                        >
                            <UserShieldIcon className="w-6 h-6"/>
                            Mode Admin
                        </button>
                    )}
                </nav>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [verifiedStations, setVerifiedStations] = useState<Station[]>([]);
    const [unverifiedStations, setUnverifiedStations] = useState<Station[]>([]);
    const [view, setView] = useState<View>('dashboard');
    const [trendAnalysis, setTrendAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
    const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(mockIncidents);
    const [isOwnerFlowActive, setIsOwnerFlowActive] = useState(false);
    const [managedStation, setManagedStation] = useState<Station | null>(null);
    const [isAddingStation, setIsAddingStation] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isIntegrityReportModalOpen, setIsIntegrityReportModalOpen] = useState(false);
    const [integrityReports, setIntegrityReports] = useState<IntegrityReport[]>([]);
    const [isIncidentReportModalOpen, setIsIncidentReportModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const verified: Station[] = [];
        const unverified: Station[] = [];
        initialStations.forEach(station => {
            if (station.verified === false || station.status === StationStatus.PENDING_VALIDATION) {
                unverified.push(station);
            } else {
                verified.push(station);
            }
        });
        setVerifiedStations(verified);
        setUnverifiedStations(unverified);
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string) => {
        setToast({ message, key: Date.now() });
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setTrendAnalysis(null);
        try {
            const result = await analyzeFuelTrends(verifiedStations);
            setTrendAnalysis(result);
        } catch (error) {
            console.error("Analysis failed:", error);
            setTrendAnalysis("L'analyse a échoué. Veuillez réessayer.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFindNearby = () => {
        // This is a mock function. In a real app, you'd use navigator.geolocation
        console.log("Recherche des stations à proximité...");
        const availableStations = verifiedStations.filter(s => s.status === StationStatus.AVAILABLE);
        if (availableStations.length > 0) {
            const randomStation = availableStations[Math.floor(Math.random() * availableStations.length)];
            setSelectedStationId(randomStation.id);
            setView('map');
        } else {
            alert("Désolé, aucune station disponible n'a été trouvée.");
        }
    };

    const handleUpdateStationStatus = (stationId: number, newStatus: Partial<Station>) => {
        const updater = (station: Station) => station.id === stationId ? { ...station, ...newStatus, lastUpdate: new Date() } : station;
        
        setVerifiedStations(prev => prev.map(updater));
        setUnverifiedStations(prev => prev.map(updater));
        
        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        showToast(`Statut mis à jour avec succès à ${time}.`);
    };

    const handleSubmitForReview = (stationId: number, changes: any) => {
        console.log("Changes submitted for review for station", stationId, changes);
        showToast("Vos modifications ont été soumises pour validation.");
        // In a real app, this would send data to a backend.
        handleClosePortal();
    };

    const handleAddNewStationRequest = (newStationData: any) => {
        const parsedCommuneId = parseInt(newStationData.communeId, 10);
        const newStation: Station = {
            id: Date.now(), // Use timestamp for a unique ID in this mock setup
            name: newStationData.name,
            address: newStationData.address,
            communeId: parsedCommuneId,
            communeName: communes.find(c => c.id === parsedCommuneId)?.name || '',
            location: {
                lat: parseFloat(newStationData.location.lat),
                lon: parseFloat(newStationData.location.lon),
            },
            status: StationStatus.PENDING_VALIDATION,
            fuelAvailability: newStationData.fuelAvailability,
            queue: QueueLength.NONE,
            queueSize: 0,
            lastUpdate: new Date(),
            verified: false,
            imageUrl: newStationData.imageUrl,
        };
        setUnverifiedStations(prev => [...prev, newStation]);
        showToast("Station soumise avec succès. Elle sera visible publiquement après vérification par notre équipe (Mode Admin).");
        handleClosePortal();
    };
    
    const handleIntegrityReportSubmit = (reportData: Omit<IntegrityReport, 'id' | 'reportedAt'>) => {
        const newReport: IntegrityReport = {
            ...reportData,
            id: Date.now(),
            reportedAt: new Date(),
        };
        setIntegrityReports(prev => [...prev, newReport]);
        setIsIntegrityReportModalOpen(false);
        showToast("Signalement envoyé. Merci pour votre contribution.");
        // The console.log simulates the data being sent to a secure backend, it is not displayed in the UI.
        console.log("New Integrity Report Submitted (for moderation view only):", newReport);
    };

    const handleIncidentReportSubmit = (reportData: Omit<IncidentReport, 'id' | 'reportedAt'>) => {
        const newReport: IncidentReport = {
            ...reportData,
            id: Date.now(),
            reportedAt: new Date(),
        };
        setIncidentReports(prev => [newReport, ...prev]);
        setIsIncidentReportModalOpen(false);
        showToast("Signalement d'incident envoyé. Merci.");
    };

    const handleClosePortal = () => {
        setManagedStation(null);
        setIsOwnerFlowActive(false);
        setIsAddingStation(false);
    };

    const handleMobileNavigate = (targetView: View) => {
        if (targetView === 'admin' && !isAdminAuthenticated) {
            handleAdminClick();
            return;
        }
        setView(targetView);
        setIsMobileMenuOpen(false);
    };

    const handleOpenOwnerPortalFromMobile = () => {
        setIsOwnerFlowActive(true);
        setIsMobileMenuOpen(false);
    };

    const handleAdminClickFromMobile = () => {
        setIsMobileMenuOpen(false);
        handleAdminClick();
    };

    const handleSelectStationOnMap = (stationId: number) => {
        setSelectedStationId(stationId);
        setView('map');
    };

    const handleApproveStation = (stationId: number) => {
        const stationToVerify = unverifiedStations.find(s => s.id === stationId);
        if (stationToVerify) {
            const verifiedStation = { ...stationToVerify, status: StationStatus.AVAILABLE, verified: true, lastUpdate: new Date() };
            setUnverifiedStations(prev => prev.filter(s => s.id !== stationId));
            setVerifiedStations(prev => [...prev, verifiedStation]);
            showToast('Station vérifiée et publiée !');
        }
    };

    const handleRejectStation = (stationId: number) => {
        setUnverifiedStations(prev => prev.filter(s => s.id !== stationId));
        showToast('Soumission de station rejetée.');
    };
    
    const handleAdminLogin = (password: string): boolean => {
        // In a real app, this would be a secure API call.
        if (password === 'admin2024') {
            setIsAdminAuthenticated(true);
            setIsAuthModalOpen(false);
            setView('admin');
            showToast("Authentification réussie. Bienvenue !");
            return true;
        }
        return false;
    };

    const handleAdminLogout = () => {
        setIsAdminAuthenticated(false);
        setView('dashboard');
        setIsMobileMenuOpen(false);
        showToast("Vous avez été déconnecté.");
    };

    const handleAdminClick = () => {
        if (isAdminAuthenticated) {
            setView('admin');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const allStations = useMemo(() => [...verifiedStations, ...unverifiedStations], [verifiedStations, unverifiedStations]);

    const StationSelectorModal: React.FC = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col animate-fade-in-up">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">Sélectionnez votre station</h2>
                    <button onClick={() => setIsOwnerFlowActive(false)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>
                <div className="overflow-y-auto p-4">
                     <div className="mb-4">
                        <button
                            onClick={() => { setIsAddingStation(true); setIsOwnerFlowActive(false); }}
                            className="w-full text-left p-3 rounded-lg bg-mali-green text-white hover:bg-green-700 transition-colors flex items-center gap-3 font-semibold"
                        >
                            <PlusCircleIcon className="w-6 h-6"/>
                            <span>Ajouter une nouvelle station</span>
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {verifiedStations.map(station => (
                            <li key={station.id}>
                                <button
                                    onClick={() => { setManagedStation(station); setIsOwnerFlowActive(false); }}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-4"
                                >
                                    <img src={station.imageUrl || `https://ui-avatars.com/api/?name=${station.name.charAt(0)}&background=random`} alt={station.name} className="w-12 h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{station.name}</p>
                                        <p className="text-sm text-gray-500">{station.address}, {station.communeName}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    const Header = () => (
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-3 text-left transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mali-green rounded-lg"
          aria-label="Retour à la page d'accueil"
        >
            <LogoIcon className="w-10 h-10" />
            <div>
                <h1 className="text-xl font-bold text-gray-800">Faso Carburant</h1>
                <p className="text-sm text-gray-500">La Boussole du Citoyen</p>
            </div>
        </button>
        <nav className="hidden md:flex items-center gap-2">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'dashboard' ? 'bg-mali-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Tableau de Bord</button>
            <button onClick={() => setView('map')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'map' ? 'bg-mali-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Carte</button>
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'list' ? 'bg-mali-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Liste</button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button onClick={() => setIsOwnerFlowActive(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors">
                <KeyIcon className="w-5 h-5"/>
                Espace Propriétaire
            </button>
             {isAdminAuthenticated ? (
                <>
                    <button onClick={() => setView('admin')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'admin' ? 'bg-blue-600 text-white' : 'text-blue-800 bg-blue-100 hover:bg-blue-200'}`}>
                        <UserShieldIcon className="w-5 h-5"/>
                        Portail Admin
                    </button>
                     <button onClick={handleAdminLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-red-800 bg-red-100 hover:bg-red-200 transition-colors">
                        <ArrowRightOnRectangleIcon className="w-5 h-5"/>
                    </button>
                </>
             ) : (
                <button onClick={handleAdminClick} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 transition-colors">
                    <UserShieldIcon className="w-5 h-5"/>
                    Mode Admin
                </button>
             )}
        </nav>
        <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
        </div>
      </header>
    );

    const renderContent = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard stations={verifiedStations} communes={communes} onNavigateToList={() => setView('list')} onNavigateToMap={() => setView('map')} onFindNearby={handleFindNearby} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} trendAnalysis={trendAnalysis} incidentReports={incidentReports} onOpenIntegrityReportModal={() => setIsIntegrityReportModalOpen(true)} />;
            case 'map':
                return <MapView stations={verifiedStations} selectedStationId={selectedStationId} onSelectStation={setSelectedStationId} onFindNearby={handleFindNearby} onOpenIncidentReportModal={() => setIsIncidentReportModalOpen(true)}/>;
            case 'list':
                return <StationList stations={allStations} communes={communes} onSelectStationOnMap={handleSelectStationOnMap} />;
            case 'admin':
                if (!isAdminAuthenticated) {
                    // This is a fallback, user should be redirected before this happens
                    return <Dashboard stations={verifiedStations} communes={communes} onNavigateToList={() => setView('list')} onNavigateToMap={() => setView('map')} onFindNearby={handleFindNearby} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} trendAnalysis={trendAnalysis} incidentReports={incidentReports} onOpenIntegrityReportModal={() => setIsIntegrityReportModalOpen(true)} />;
                }
                return <AdminPortal 
                            allStations={allStations}
                            pendingStations={unverifiedStations}
                            integrityReports={integrityReports}
                            incidentReports={incidentReports}
                            onApprove={handleApproveStation}
                            onReject={handleRejectStation}
                       />;
            default:
                return null;
        }
    }

    return (
        <div className="font-sans bg-gray-50 min-h-screen">
            <Header />
            <main>
                 <div className="container mx-auto px-4 py-6">
                    {renderContent()}
                 </div>
            </main>

            {isOwnerFlowActive && <StationSelectorModal />}

            {(managedStation || isAddingStation) && (
                <OwnerPortal 
                    station={isAddingStation ? undefined : managedStation!} 
                    communes={communes}
                    onClose={handleClosePortal} 
                    onUpdateStatus={handleUpdateStationStatus}
                    onSubmitForReview={isAddingStation ? handleAddNewStationRequest : (data) => handleSubmitForReview(managedStation!.id, data)}
                />
            )}

            {isMobileMenuOpen && (
                <MobileMenu 
                    onClose={() => setIsMobileMenuOpen(false)} 
                    onNavigate={handleMobileNavigate} 
                    onOpenOwnerPortal={handleOpenOwnerPortalFromMobile}
                    onAdminClick={handleAdminClickFromMobile}
                    onAdminLogout={handleAdminLogout}
                    isAdminAuthenticated={isAdminAuthenticated}
                />
            )}
        
            {isIntegrityReportModalOpen && (
                <IntegrityReportModal 
                    stations={verifiedStations} 
                    onClose={() => setIsIntegrityReportModalOpen(false)} 
                    onSubmit={handleIntegrityReportSubmit}
                />
            )}

             {isIncidentReportModalOpen && (
                <IncidentReportModal
                    stations={verifiedStations}
                    onClose={() => setIsIncidentReportModalOpen(false)}
                    onSubmit={handleIncidentReportSubmit}
                />
            )}
            
            {isAuthModalOpen && (
                <AdminLoginModal 
                    onClose={() => setIsAuthModalOpen(false)}
                    onLogin={handleAdminLogin}
                />
            )}

            {toast && (
                <div key={toast.key} className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white py-2.5 px-6 rounded-full shadow-lg z-[100] animate-fade-in-up text-sm font-semibold">
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default App;
