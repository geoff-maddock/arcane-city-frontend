import { useMemo, useState } from 'react';

type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type ActionType = 'train' | 'act' | 'convert';
type BoardType = 'dungeon' | 'tower' | 'forest' | 'city';

interface Card {
  suit: Suit;
  rank: string;
  value: number;
}

interface Player {
  id: number;
  name: string;
  isBot: boolean;
  hp: number;
  focus: number;
  xp: number;
  gold: number;
  relics: number;
  materials: number;
  herbs: number;
  might: number;
  spirit: number;
  craft: number;
  lore: number;
  locationProgress: Record<BoardType, number>;
  actionChoice: ActionType;
  boardChoice: BoardType;
}

interface TurnLog {
  round: number;
  playerName: string;
  text: string;
}

const SUIT_SYMBOL: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const BOARD_LABELS: Record<BoardType, string> = {
  dungeon: 'Dungeon',
  tower: 'Tower',
  forest: 'Forest',
  city: 'City',
};

const BOARD_IMAGES: Record<BoardType, string> = {
  dungeon: '/images/fantasy-flip/dungeon-board.svg',
  tower: '/images/fantasy-flip/tower-board.svg',
  forest: '/images/fantasy-flip/forest-board.svg',
  city: '/images/fantasy-flip/city-board.svg',
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const suitToAttribute = (suit: Suit): keyof Pick<Player, 'might' | 'spirit' | 'craft' | 'lore'> => {
  if (suit === 'spades') return 'might';
  if (suit === 'hearts') return 'spirit';
  if (suit === 'diamonds') return 'craft';
  return 'lore';
};

const makeDeck = (): Card[] => {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      let value = Number(rank);
      if (rank === 'A') value = 1;
      if (rank === 'J') value = 11;
      if (rank === 'Q') value = 12;
      if (rank === 'K') value = 13;
      deck.push({ suit, rank, value });
    }
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

const botActionChoice = (player: Player): { actionChoice: ActionType; boardChoice: BoardType } => {
  const hpLow = player.hp <= 5;
  const growthLow = Math.min(player.might, player.spirit, player.craft, player.lore) <= 3;

  if (hpLow) {
    return { actionChoice: 'convert', boardChoice: 'forest' };
  }

  if (growthLow) {
    return { actionChoice: 'train', boardChoice: 'city' };
  }

  const boardByNeed: BoardType = player.relics < 2 ? 'dungeon' : player.focus < 4 ? 'tower' : player.gold < 8 ? 'city' : 'forest';

  return { actionChoice: 'act', boardChoice: boardByNeed };
};

const makePlayer = (id: number, isBot: boolean): Player => ({
  id,
  name: isBot ? `Bot ${id}` : `Player ${id}`,
  isBot,
  hp: 12,
  focus: 2,
  xp: 0,
  gold: 0,
  relics: 0,
  materials: 0,
  herbs: 0,
  might: 1,
  spirit: 1,
  craft: 1,
  lore: 1,
  locationProgress: {
    dungeon: 0,
    tower: 0,
    forest: 0,
    city: 0,
  },
  actionChoice: 'train',
  boardChoice: 'dungeon',
});

const scorePlayer = (player: Player): number => {
  const attrScore = player.might + player.spirit + player.craft + player.lore;
  const locationScore = Object.values(player.locationProgress).reduce((sum, value) => sum + value, 0);
  return player.xp + player.gold + (player.relics * 3) + player.materials + player.herbs + attrScore + locationScore + player.hp;
};

const resolveAction = (player: Player, actionChoice: ActionType, boardChoice: BoardType, playerCard: Card, adventureCard: Card): { updated: Player; logs: string[] } => {
  const updated: Player = {
    ...player,
    locationProgress: { ...player.locationProgress },
  };

  const logs: string[] = [];
  const cardValue = playerCard.value;
  const cardSuit = playerCard.suit;
  const checkTarget = Math.ceil(adventureCard.value / 2) + 2;

  if (actionChoice === 'train') {
    const trainedAttribute = suitToAttribute(cardSuit);
    const gain = cardValue >= 11 ? 2 : 1;
    updated[trainedAttribute] = clamp(updated[trainedAttribute] + gain, 0, 12);
    updated.xp += gain;
    logs.push(`${updated.name} trained ${trainedAttribute} +${gain}.`);
  }

  if (actionChoice === 'convert') {
    updated.focus = clamp(updated.focus + 2, 0, 12);
    updated.gold += 1;
    if (cardSuit === 'hearts') {
      updated.hp = clamp(updated.hp + 1, 0, 16);
      logs.push(`${updated.name} converted and healed 1 HP.`);
    } else {
      logs.push(`${updated.name} converted card power to +2 focus and +1 gold.`);
    }
  }

  if (actionChoice === 'act') {
    const effectiveValue = cardValue + (updated.focus >= 1 ? 1 : 0);
    updated.focus = clamp(updated.focus - 1, 0, 12);
    updated.locationProgress[boardChoice] += 1;

    if (boardChoice === 'dungeon') {
      const combat = updated.might + (cardSuit === 'spades' ? 2 : 0) + Math.floor(effectiveValue / 4);
      if (combat >= checkTarget) {
        updated.relics += 1;
        updated.xp += 2;
        logs.push(`${updated.name} cleared a dungeon chamber and found a relic.`);
      } else {
        updated.hp = clamp(updated.hp - 1, 0, 16);
        updated.xp += 1;
        logs.push(`${updated.name} fought in the dungeon but took 1 damage.`);
      }
    }

    if (boardChoice === 'tower') {
      const arcana = updated.lore + updated.spirit + (cardSuit === 'clubs' ? 2 : 0);
      updated.xp += 1;
      if (arcana + Math.floor(effectiveValue / 5) >= checkTarget) {
        updated.focus = clamp(updated.focus + 2, 0, 12);
        updated.relics += 1;
        logs.push(`${updated.name} stabilized tower runes and gained +2 focus and a relic.`);
      } else {
        updated.hp = clamp(updated.hp - 1, 0, 16);
        logs.push(`${updated.name} triggered a tower backlash and lost 1 HP.`);
      }
    }

    if (boardChoice === 'forest') {
      const gather = updated.craft + updated.lore + (cardSuit === 'diamonds' ? 2 : 0);
      if (gather >= checkTarget) {
        updated.materials += 2;
        updated.herbs += 1;
        updated.hp = clamp(updated.hp + 1, 0, 16);
        logs.push(`${updated.name} gathered resources in the forest (+2 materials, +1 herb, +1 HP).`);
      } else {
        updated.materials += 1;
        if (adventureCard.suit === 'spades') {
          updated.hp = clamp(updated.hp - 1, 0, 16);
          logs.push(`${updated.name} found scraps in the forest but suffered an ambush (-1 HP).`);
        } else {
          logs.push(`${updated.name} foraged the forest (+1 material).`);
        }
      }
    }

    if (boardChoice === 'city') {
      const civic = updated.spirit + updated.craft + (cardSuit === 'hearts' || cardSuit === 'diamonds' ? 1 : 0);
      updated.gold += 1;
      if (civic + Math.floor(effectiveValue / 5) >= checkTarget) {
        updated.gold += 2;
        updated.xp += 2;
        logs.push(`${updated.name} chained city mini-games (+3 gold total, +2 XP).`);
      } else {
        updated.xp += 1;
        logs.push(`${updated.name} visited one city establishment (+1 gold, +1 XP).`);
      }
    }
  }

  if (adventureCard.suit === 'spades' && actionChoice !== 'convert') {
    const guard = updated.might + updated.spirit;
    if (guard < Math.ceil(adventureCard.value / 2)) {
      updated.hp = clamp(updated.hp - 1, 0, 16);
      logs.push(`${updated.name} suffered global danger from the adventure deck (-1 HP).`);
    }
  }

  return { updated, logs };
};

const cardLabel = (card: Card | null) => card ? `${card.rank}${SUIT_SYMBOL[card.suit]}` : '—';

export function FantasyFlipGame() {
  const [humanPlayers, setHumanPlayers] = useState(1);
  const [botPlayers, setBotPlayers] = useState(1);
  const [maxRounds, setMaxRounds] = useState(12);

  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [adventureDeck, setAdventureDeck] = useState<Card[]>([]);
  const [playerDiscard, setPlayerDiscard] = useState<Card[]>([]);
  const [adventureDiscard, setAdventureDiscard] = useState<Card[]>([]);

  const [playerCard, setPlayerCard] = useState<Card | null>(null);
  const [adventureCard, setAdventureCard] = useState<Card | null>(null);
  const [log, setLog] = useState<TurnLog[]>([]);

  const ranking = useMemo(() => {
    return [...players]
      .sort((a, b) => scorePlayer(b) - scorePlayer(a))
      .map((player, index) => ({
        ...player,
        score: scorePlayer(player),
        place: index + 1,
      }));
  }, [players]);

  const startGame = () => {
    const totalPlayers = humanPlayers + botPlayers;
    const initPlayers = Array.from({ length: totalPlayers }, (_, idx) => makePlayer(idx + 1, idx >= humanPlayers));
    const playerChoicesApplied = initPlayers.map((player) => {
      if (!player.isBot) return player;
      return { ...player, ...botActionChoice(player) };
    });

    setPlayers(playerChoicesApplied);
    setRound(0);
    setGameOver(false);
    setStarted(true);
    setPlayerDeck(makeDeck());
    setAdventureDeck(makeDeck());
    setPlayerDiscard([]);
    setAdventureDiscard([]);
    setPlayerCard(null);
    setAdventureCard(null);
    setLog([]);
  };

  const updatePlayerChoice = (playerId: number, field: 'actionChoice' | 'boardChoice', value: ActionType | BoardType) => {
    setPlayers((previous) => previous.map((player) => {
      if (player.id !== playerId || player.isBot) return player;
      return {
        ...player,
        [field]: value,
      } as Player;
    }));
  };

  const drawFromDeck = (
    deck: Card[],
    discard: Card[],
    setDeck: (value: Card[]) => void,
    setDiscard: (value: Card[]) => void,
  ): Card => {
    let workingDeck = [...deck];
    let workingDiscard = [...discard];

    if (workingDeck.length === 0) {
      workingDeck = [...workingDiscard];
      for (let i = workingDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [workingDeck[i], workingDeck[j]] = [workingDeck[j], workingDeck[i]];
      }
      workingDiscard = [];
    }

    const drawn = workingDeck.shift();
    if (!drawn) {
      throw new Error('Deck draw failed.');
    }

    setDeck(workingDeck);
    setDiscard(workingDiscard);
    return drawn;
  };

  const nextRound = () => {
    if (!started || gameOver) return;

    const drawnPlayerCard = drawFromDeck(playerDeck, playerDiscard, setPlayerDeck, setPlayerDiscard);
    const drawnAdventureCard = drawFromDeck(adventureDeck, adventureDiscard, setAdventureDeck, setAdventureDiscard);

    setPlayerCard(drawnPlayerCard);
    setAdventureCard(drawnAdventureCard);

    setPlayerDiscard((previous) => [...previous, drawnPlayerCard]);
    setAdventureDiscard((previous) => [...previous, drawnAdventureCard]);

    const currentRound = round + 1;
    const pendingLogs: TurnLog[] = [];

    const updatedPlayers = players.map((player) => {
      const decision = player.isBot ? botActionChoice(player) : {
        actionChoice: player.actionChoice,
        boardChoice: player.boardChoice,
      };

      const { updated, logs } = resolveAction(player, decision.actionChoice, decision.boardChoice, drawnPlayerCard, drawnAdventureCard);
      pendingLogs.push(...logs.map((text) => ({ round: currentRound, playerName: player.name, text })));

      return {
        ...updated,
        actionChoice: decision.actionChoice,
        boardChoice: decision.boardChoice,
      };
    });

    setLog((previous) => [...previous, ...pendingLogs]);

    setPlayers(updatedPlayers);
    setRound(currentRound);

    const everyoneDefeated = updatedPlayers.every((player) => player.hp <= 0);
    if (currentRound >= maxRounds || everyoneDefeated) {
      setGameOver(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen bg-stone-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <header className="rounded-xl border border-amber-600/30 bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 p-6 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">FANTASY FLIP</h1>
          <p className="mt-2 text-sm md:text-base max-w-3xl text-zinc-700 dark:text-zinc-300">
            A flip-and-write inspired fantasy board game with dual decks, shared adventure boards, dry-erase style progression tracks,
            and support for solo or bot opponents.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <h2 className="font-semibold text-lg">Setup</h2>
            <label className="block text-sm">
              Human Players
              <input
                className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
                type="number"
                min={1}
                max={4}
                value={humanPlayers}
                onChange={(event) => setHumanPlayers(clamp(Number(event.target.value) || 1, 1, 4))}
              />
            </label>
            <label className="block text-sm">
              Computer Players
              <input
                className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
                type="number"
                min={0}
                max={4}
                value={botPlayers}
                onChange={(event) => setBotPlayers(clamp(Number(event.target.value) || 0, 0, 4))}
              />
            </label>
            <label className="block text-sm">
              Rounds
              <input
                className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
                type="number"
                min={8}
                max={24}
                value={maxRounds}
                onChange={(event) => setMaxRounds(clamp(Number(event.target.value) || 12, 8, 24))}
              />
            </label>
            <button
              type="button"
              className="w-full rounded bg-amber-700 hover:bg-amber-800 text-white p-2 font-semibold"
              onClick={startGame}
            >
              {started ? 'Restart Game' : 'Start Game'}
            </button>
          </div>

          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <h2 className="font-semibold text-lg mb-3">Round State</h2>
            <p><strong>Round:</strong> {started ? `${round} / ${maxRounds}` : 'Not started'}</p>
            <p><strong>Player Deck Card:</strong> {cardLabel(playerCard)}</p>
            <p><strong>Adventure Deck Card:</strong> {cardLabel(adventureCard)}</p>
            <p><strong>Player Deck Remaining:</strong> {playerDeck.length}</p>
            <p><strong>Adventure Deck Remaining:</strong> {adventureDeck.length}</p>
            {started && (
              <button
                type="button"
                className="mt-4 w-full rounded bg-indigo-700 hover:bg-indigo-800 disabled:bg-zinc-400 text-white p-2 font-semibold"
                onClick={nextRound}
                disabled={gameOver}
              >
                {gameOver ? 'Game Over' : 'Resolve Next Round'}
              </button>
            )}
          </div>

          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
            <h2 className="font-semibold text-lg">Victory</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Score = stats + progress + resources + relics + XP + remaining HP.</p>
            <ol className="text-sm space-y-1 mt-2">
              {ranking.slice(0, 4).map((player) => (
                <li key={player.id}>
                  #{player.place} {player.name}: <strong>{player.score}</strong>
                </li>
              ))}
            </ol>
            {gameOver && ranking[0] && (
              <p className="mt-3 rounded bg-emerald-100 dark:bg-emerald-900/30 p-2 text-sm">
                Winner: <strong>{ranking[0].name}</strong>
              </p>
            )}
          </div>
        </section>

        {started && (
          <section className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <h2 className="font-semibold text-lg mb-3">Character Boards</h2>
            <div className="grid xl:grid-cols-2 gap-4">
              {players.map((player) => (
                <article key={player.id} className="rounded border border-zinc-300 dark:border-zinc-700 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{player.name} {player.isBot ? '(CPU)' : ''}</h3>
                    <span className="text-sm text-zinc-500">HP {player.hp}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <p>♠ Might: {player.might}</p>
                    <p>♥ Spirit: {player.spirit}</p>
                    <p>♦ Craft: {player.craft}</p>
                    <p>♣ Lore: {player.lore}</p>
                    <p>XP: {player.xp}</p>
                    <p>Focus: {player.focus}</p>
                    <p>Gold: {player.gold}</p>
                    <p>Relics: {player.relics}</p>
                    <p>Materials: {player.materials}</p>
                    <p>Herbs: {player.herbs}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <label>
                      Action
                      <select
                        disabled={player.isBot || gameOver}
                        value={player.actionChoice}
                        onChange={(event) => updatePlayerChoice(player.id, 'actionChoice', event.target.value as ActionType)}
                        className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 disabled:opacity-60"
                      >
                        <option value="train">Train</option>
                        <option value="act">Act</option>
                        <option value="convert">Convert</option>
                      </select>
                    </label>
                    <label>
                      Adventure Board
                      <select
                        disabled={player.isBot || gameOver}
                        value={player.boardChoice}
                        onChange={(event) => updatePlayerChoice(player.id, 'boardChoice', event.target.value as BoardType)}
                        className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 disabled:opacity-60"
                      >
                        <option value="dungeon">Dungeon</option>
                        <option value="tower">Tower</option>
                        <option value="forest">Forest</option>
                        <option value="city">City</option>
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h2 className="font-semibold text-lg mb-3">Adventure Boards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(Object.keys(BOARD_IMAGES) as BoardType[]).map((boardKey) => (
              <figure key={boardKey} className="rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-950">
                <img src={BOARD_IMAGES[boardKey]} alt={`${BOARD_LABELS[boardKey]} board`} className="w-full h-auto rounded" />
                <figcaption className="text-sm mt-2 text-zinc-700 dark:text-zinc-300">
                  <strong>{BOARD_LABELS[boardKey]}:</strong> {boardKey === 'dungeon' && 'Maze crawl with relic rewards and combat checks.'}
                  {boardKey === 'tower' && 'Vertical arcane ascent with instability pressure.'}
                  {boardKey === 'forest' && 'Resource gathering loops with danger pulses.'}
                  {boardKey === 'city' && 'Mini-game districts for conversion combos.'}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h2 className="font-semibold text-lg mb-3">Game Log</h2>
          <div className="max-h-72 overflow-auto text-sm space-y-2">
            {log.length === 0 && <p className="text-zinc-500">No turns resolved yet.</p>}
            {log.slice().reverse().map((entry, index) => (
              <p key={`${entry.round}-${entry.playerName}-${index}`}>
                <span className="font-semibold">R{entry.round} · {entry.playerName}</span>: {entry.text}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
