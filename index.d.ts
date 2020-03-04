declare module '@ahamove/format-vn-address' {
  export function format(str: string): string
  export function isVenue(str: string): string
  export function isAddress(str: string): string
  export function extract(str: string): string
}
