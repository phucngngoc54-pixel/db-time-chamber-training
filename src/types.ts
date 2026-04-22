export type Screen = 'lobby' | 'character-select' | 'timer';

export interface Character {
  id: string;
  name: string;
  image: string;
  color: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: number;
}
