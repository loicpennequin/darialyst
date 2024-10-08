import type { Doc } from '../_generated/dataModel';

export type Game = Omit<Doc<'games'>, 'id'>;

export type GameDetails = Doc<'gameDetails'>;
