import { PositionJson } from "./PositionJson"

export interface CreateRobotRequest{
    botname: string
    description: string
}

export interface UpdateRobotRequest{
    botname: string
    description: string
}

export interface UpdateInitialPositionRequest{
    initial_position: PositionJson
}

export interface UpdateCurrentPositionRequest{
    current_position: PositionJson
}