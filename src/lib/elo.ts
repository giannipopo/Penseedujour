export const STARTING_ELO = 500;

export function getDivision(elo: number): number {
    // Divisions start at 0, step 200.
    // 0-199: Div 0
    // 200-399: Div 1
    // ...
    if (elo < 0) return 0;
    return Math.floor(elo / 200);
}

export function calculateEloChange(winnerElo: number, loserElo: number): number {
    const K = 32; // K-factor determines volatility
    const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    // Result is the points won by the winner (and lost by the loser)
    return Math.round(K * (1 - expectedScore));
}
