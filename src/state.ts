import { LunchState } from "./types";

export class StateManager {
    private state = new Array<LunchState>();

    get(): Array<LunchState> {
        return this.state;
    }

    set(state: Array<LunchState>): void {
        this.state = state;
    }

    clear(): void {
        this.state = new Array<LunchState>();
    }
}
