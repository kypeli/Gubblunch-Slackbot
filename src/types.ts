export interface LunchState {
    userId: string | null;
    agreedDate: string | null;
}

export interface GeminiResponse {
    response: string;
    lunchState: Partial<Array<LunchState>> | null;
}
