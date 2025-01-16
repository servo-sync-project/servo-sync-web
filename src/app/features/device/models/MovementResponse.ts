import { CoordinatesJson } from "./CoordinatesJson"

export interface MovementResponse{
    id: number
    name: string
    coordinates: CoordinatesJson | null
}