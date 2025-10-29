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

// 'LiteVariant' and 'LiteProduct' types are defined in snippets/product-json-lite.liquid
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

// 'LiteCart' type is defined in snippets/cart-json.liquid
export interface LiteCart {
  total_price: number
  total_price_formatted: string
  original_total_price: number
  original_total_price_formatted: string
  items_subtotal_price: number
  items_subtotal_price_formatted: string
  item_count: number
  items: LiteLineItem[]
}

export interface LiteLineItem {
  id: number
  key: string
  title: string
  price: number
  final_line_price: number
  original_line_price: number
  original_price: number
  quantity: number
  sku: string
  vendor: string
  properties: Record<string, string>
  variant_id: number
  url: string
  image: string
  handle: string
  product_title: string
  variant_title: string
  variant_options: string[]
  item_html: string
  item_price_html: string
}

export interface SelectedOption {
  name: string
  value: string
}