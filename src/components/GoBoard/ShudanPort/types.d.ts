export type Map<T> = T[][];
export type Sign = 0 | 1 | -1;
export type Vertex = [x: number, y: number];

export interface Marker {
  type?:
    | "circle"
    | "cross"
    | "triangle"
    | "square"
    | "point"
    | "loader"
    | "label"
    | null;
  label?: string | null;
}

export interface GhostStone {
  sign: Sign;
  type?: "good" | "interesting" | "doubtful" | "bad" | null;
  faint?: boolean | null;
}

export interface HeatVertex {
  strength: number;
  text?: string | null;
}

export interface LineMarker {
  v1: Vertex;
  v2: Vertex;
  type?: "line" | "arrow";
}
