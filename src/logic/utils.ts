export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mscounter() {
  for (let i = 1; i <= 20; i++) {
    await wait(50);
    console.log(i * 50);
  }
}
