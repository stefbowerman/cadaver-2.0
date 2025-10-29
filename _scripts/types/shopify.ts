export type ThemeEditorSectionLoadEvent = CustomEvent<{
  sectionId: string
}>

export type ThemeEditorSectionUnloadEvent = CustomEvent<{
  sectionId: string
}>

export type ThemeEditorSectionSelectEvent = CustomEvent<{
  sectionId: string
  load: boolean
}>

export type ThemeEditorSectionDeselectEvent = CustomEvent<{
  sectionId: string
}>

export type ThemeEditorSectionReorderEvent = CustomEvent<{
  sectionId: string
}>

export type ThemeEditorBlockSelectEvent = CustomEvent<{
  blockId: string,
  sectionId: string,
  load: boolean
}>

export type ThemeEditorBlockDeselectEvent = CustomEvent<{
  blockId: string,
  sectionId: string
}>

export type ThemeEditorGenericEvent = ThemeEditorSectionSelectEvent | ThemeEditorSectionDeselectEvent | ThemeEditorSectionReorderEvent | ThemeEditorBlockSelectEvent | ThemeEditorBlockDeselectEvent

interface ProductOption {
  name: string
  position: number
  selected_value: string
  values: string[]
}

// 'Lite' prefixed types are defined in snippets/product-json-lite.liquid
export interface LiteVariant {
  available: boolean
  compare_at_price: number | null
  compare_at_price_formatted: string
  id: number
  name: string
  options: string[]
  price: number
  price_formatted: string
  title: string
}

export interface LiteProduct {
  id: number
  title: string
  handle: string
  available: boolean
  variants: LiteVariant[]
  options: string[]
  options_with_values: ProductOption[]
}

export interface SelectedOption {
  name: string
  value: string
}