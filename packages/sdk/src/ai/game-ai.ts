import { isDefined, randomInt, type Nullable } from '@game/shared';
import type { SerializedAction } from '../action/action';
import { GAME_PHASES } from '../game-session';
import type { ServerSession } from '../server-session';
import { Entity } from '../entity/entity';
import { AIEntityAgent } from './entity-agent';
import { AIPlayerAgent } from './player-agent';

export class GameAI {
  constructor(
    private session: ServerSession,
    private playerId: string
  ) {
    this.session.logger = () => void 0;
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get general() {
    return this.player.general;
  }

  async onUpdate(action: SerializedAction) {
    await this.session.dispatch(action);

    if (this.player.isActive || this.session.phase === GAME_PHASES.MULLIGAN) {
      const nextAction = await this.evaluateNextAction();
      return nextAction;
    }
  }

  async evaluateNextAction(): Promise<SerializedAction> {
    if (this.session.phase === GAME_PHASES.MULLIGAN) {
      return { type: 'mulligan', payload: { playerId: this.playerId, cardIndices: [] } };
    }

    const now = Date.now();
    const agent = new AIPlayerAgent(this.session, this.player);
    const action = await agent.getNextAction();
    console.log(`AI action computed in ${Date.now() - now}`, action);

    return action?.action ?? { type: 'endTurn', payload: { playerId: this.playerId } };
  }
}
