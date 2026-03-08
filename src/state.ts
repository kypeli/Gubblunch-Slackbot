import { LunchState } from "./types";

export class StateManager {
    private state = new Map<string, Array<LunchState>>();

    get(channelId: string): Array<LunchState> {
        return (
            this.state.get(channelId) ||
            new Array<LunchState>().fill({
                userId: null,
                agreeStatus: null,
            })
        );
    }

    set(channelId: string, state: Array<LunchState>): void {
        this.state.set(channelId, state);
    }

    clear(channelId: string): void {
        this.state.delete(channelId);
    }
}
