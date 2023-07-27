const block = ['top', 'bottom'] as const
const inline = ['start', 'end', 'left', 'right'] as const
type Tblock = typeof block[number]
type Tinline = typeof inline[number]
export type Anchor =
  | Tblock
  | Tinline
  | 'center'
  | 'center center'
  | `${Tblock} ${Tinline | 'center'}`
  | `${Tinline} ${Tblock | 'center'}`