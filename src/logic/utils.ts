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

export function formatPercent(float: number, prec: number = 2) {
  // there are two cases: either number leads with zeros:

  let s1 = (float * 100).toFixed(20);
  return (
    (() => {
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
    })() + "%"
  );
}
