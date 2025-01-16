import { CoordinatesJson } from "./CoordinatesJson"

export interface CreateMovementRequest {
    name: string
    coordinates: CoordinatesJson | null
    robot_id: number
}

export interface UpdateMovementRequest {
    name: string
    coordinates: CoordinatesJson | null
}