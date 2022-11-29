export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mscounter() {
  for (let i = 1; i <= 20; i++) {
    await wait(50);
    console.log(i * 50);
  }
}

export function last<T>(array: T[] | undefined): T | undefined {
  return array?.[array?.length - 1];
}

/**
 * formats a percent float with variable precision. High precision around 0% and 100%.
 * example for prec = 2:
 * 78.433425 => 78.43
 * 0.0000056298 => 0.0000056
 * 99.999999993424 => 99.9999999934
 * @param float the input
 * @param prec the minimum number of precision
 * @returns
 */
export function formatFloatForPercent(float: number, prec: number = 2): string {
  let s1 = (float * 100).toFixed(20);
  if (float === 0.0) return "0.0000000".substring(0, 2 + prec);
  if (s1.startsWith("0.0")) {
    let n = 2;
    for (let i = n; i < s1.length; i++) {
      if (s1[i] != "0") break;
      n += 1;
    }
    // n is the first nonzero value
    return s1.substring(0, n + prec);
  } else if (s1.startsWith("99.9")) {
    let n = 3;
    for (let i = n; i < s1.length; i++) {
      if (s1[i] != "9") break;
      n += 1;
    }
    // n is the first nonzero value
    return s1.substring(0, n + prec);
  } else {
    return s1[1] == "."
      ? s1.substring(0, 2 + prec)
      : s1[2] == "."
      ? s1.substring(0, 3 + prec)
      : s1.substring(0, 4 + prec);
  }
}

export function formatPercent(float: number, prec: number = 2): string {
  return formatFloatForPercent(float, prec) + "%";
}

export function formatFloat(float: number, prec: number = 2): string {
  return float.toFixed(prec);
}
export const formatFraction = (fraction: { string: string; float: number }) =>
  fraction.string;

export function asOrUndefined<T>(value: any, allValues: T[]): T | undefined {
  return allValues.find((e) => e == value) || undefined;
}

export function orUndef<T, R>(func: (arg0: T) => R) {
  return (arg0: T | undefined | null) =>
    !arg0 && arg0 !== 0 ? undefined : func(arg0);
}
