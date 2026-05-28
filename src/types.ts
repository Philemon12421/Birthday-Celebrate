/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExperienceStep =
  | 'SPLASH'
  | 'INTRO'
  | 'SURPRISE'
  | 'PHOTO'
  | 'MESSAGE'
  | 'LETTER'
  | 'CELEBRATION'
  | 'FINAL'
  | 'COMPLETED';

export interface PopupSequenceItem {
  type: ExperienceStep;
  title: string;
  subtitle?: string;
  message?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  spin?: number;
  spinSpeed?: number;
  wobble?: number;
  wobbleSpeed?: number;
}

export interface Balloon {
  id: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  color: string;
  stringLength: number;
  isPopping: boolean;
  popProgress: number;
}
