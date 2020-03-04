declare module '@ahamove/format-vn-address' {
  export function format(str: string): string
  export function isVenue(str: string): string
  export function isAddress(str: string): string

  export type ExtractResult = Partial<{
    country: string
    region: string
    county: string
    locality: string
    number: string
    street: string
    venue: string
    address: string
  }>

  export function extract(str: string): ExtractResult
}
