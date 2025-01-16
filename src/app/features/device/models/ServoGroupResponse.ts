import { ColumnEnum } from "./ServoGroupRequest"

export interface ServoGroupResponse{    
    id: number
    name: string
    num_servos: number
    column: ColumnEnum
    sequence: number
}