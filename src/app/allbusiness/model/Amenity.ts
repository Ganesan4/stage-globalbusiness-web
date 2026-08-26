export class Amenity {
    title: string;
    description: string;
    isFree: boolean;
    cost: number;
    category: string;
    status: boolean;

    constructor(title: string, description: string, isFree: boolean, cost: number, category: string) {
        this.title = title;
        this.description = description;
        this.isFree = isFree;
        this.cost = cost;
        this.category = category;
        this.status = false;
    }
}