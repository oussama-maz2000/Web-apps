export interface LocationDto {
	longitude: number;
	latitude: number;
	stateCode: number;
	municipalityCode: number;
	stateName?: string | null;
	municipalityName?: string | null;
}

export interface Municipality {
	id: number;
	code?: number;
	stateCode: number;
	latitude: number;
	longitude: number;
	name: string;
	nameAr: string;
}

// API request types
export interface LocationCoordinates {
	latitude: number;
	longitude: number;
}

export interface AdministrativeLocation {
	municipalityCode: number;
	stateCode: number;
}
