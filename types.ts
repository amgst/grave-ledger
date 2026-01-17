
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface GraveRecord {
  id: string;
  deceasedFullName: string;
  parentNames: string;
  husbandName?: string;
  relativeContact?: string;
  dateOfBirth?: string;
  dateOfDeath: string;
  ageAtDeath: number;
  gender: Gender;
  graveNumber: string;
  imageUrl?: string;
  notes: string;
  createdAt: string;
}
