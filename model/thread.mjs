export class Thread {
    constructor(startDate, endDate, closedDate, ideaCount, name, description) {
        this.startDate = startDate;
        this.endDate = endDate;
        (this.closedDate = closedDate), (this.ideaCount = ideaCount);
        this.name = name;
        this.description = description;
    }

    static fromJson(json) {
        return new Thread(
            json.startDate,
            json.endDate,
            json.closedDate,
            json.ideaCount,
            json.name,
            json.description
        );
    }

    toJson() {
        return {
            startDate: this.startDate,
            endDate: this.endDate,
            closedDate: this.closedDate,
            ideaCount: this.ideaCount,
            name: this.name,
            description: this.description,
        };
    }
}
