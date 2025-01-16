import { PositionJson } from "./PositionJson"

export interface RobotResponse{
    id: number
    unique_uid: string
    botname: string
    description: string
    image_url: string | null
    config_image_url: string | null
    initial_position: PositionJson | null
    current_position: PositionJson | null
    is_connected_broker: boolean
}

export interface RobotResponseForAll{
    id: number
    botname: string
    description: string
    image_url: string | null
    is_connected_broker: boolean
}