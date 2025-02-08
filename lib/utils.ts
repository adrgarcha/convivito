export function capitalizeFirst(string: string): string {
   return string[0].toUpperCase() + string.slice(1);
}

export function getDayOfWeek(): number {
   const date = new Date();
   const day = date.getDay();

   const dayOfWeek = day === 0 ? 6 : day - 1;

   return dayOfWeek;
}
