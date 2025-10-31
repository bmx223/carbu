export interface Commune {
  id: number;
  name: string;
}

export enum FuelType {
  GASOLINE = 'Essence',
  DIESEL = 'Gasoil',
  KEROSENE = 'Pétrole',
}

export enum QueueLength {
  SHORT = 'Courte',
  MEDIUM = 'Moyenne',
  LONG = 'Longue',
  NONE = 'Aucune',
}

export enum StationStatus {
  AVAILABLE = 'Disponible',
  UNAVAILABLE = 'Rupture de stock',
  CLOSED = 'Fermée',
}

export interface Station {
  id: number;
  name: string;
  address: string;
  communeId: number;
  communeName: string;
  location: {
    lat: number;
    lon: number;
  };
  status: StationStatus;
  fuelAvailability: {
    [key in FuelType]?: boolean;
  };
  queue: QueueLength;
  queueSize?: number | null; // Ajout du champ pour la taille de la file
  lastUpdate: Date;
  verified?: boolean;
  imageUrl?: string;
}

export interface Report {
    stationId: number;
    status: StationStatus;
    queue: QueueLength;
    queueSize?: number | null; // Ajout du champ pour la taille de la file
    fuelAvailability: {
      [key in FuelType]?: boolean;
    };
    verified?: boolean;
}

export enum IncidentType {
  ABUSE = 'Abus (ex: favoritisme, prix non-conformes)',
  BLACK_MARKET = 'Vente au marché noir',
  DISPUTE = 'Dispute / Altercation',
}

export interface IncidentReport {
  id: number;
  stationId: number;
  incidentType: IncidentType;
  description: string;
  reportedAt: Date;
}