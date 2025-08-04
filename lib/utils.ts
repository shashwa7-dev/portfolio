export function cn(...inputs: unknown[]): string {
  return inputs
    .flatMap((input) => {
      if (typeof input === "string") return input.split(" ");
      if (typeof input === "object" && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(" ");
}
