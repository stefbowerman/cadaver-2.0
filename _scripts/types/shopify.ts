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
