import { EventComment } from "./eventComment";

export class Event {
    _id!: string;
    id!: number;
    name!: string;
    category!: string;
    type!: string;
    sports!: string[];
    description!: string;
    author!: string;
    location!: string;
    coordinates!: number[];
    rating?: number;
    comments?: EventComment[];
    locationId?: string[];
    users?: string[];
    startDate?: Date;
    endDate?: Date;
    interval?: string;
    locationAddName?: string;
    distance!: number;
  }