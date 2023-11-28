import { Event } from "./event";

export class EventPaginationResponse {
    events!: Event[];
    totalPages!: number;
    currentPage!: number;
    totalCount!: number;
}