import { Comment } from "./comment";

export class Location {
    _id!: string;
    name!: string;
    category!: string;
    type!: string;
    sports!: string[];
    description!: string;
    author!: string;
    location!: string;
    coordinates!: number[];
    rating?: number;
    distance!: number;
    comments?: Comment[];
  
  
    //comments: { type: [commentSchema] },
  }