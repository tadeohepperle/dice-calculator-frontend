import { greet } from "dices";

export function hello(): void {
  let g: string = greet();
  console.warn(g);
}
