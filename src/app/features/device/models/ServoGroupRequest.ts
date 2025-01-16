export enum ColumnEnum {
    RIGHT = "right",
    MIDDLE = "middle",
    LEFT = "left",
}

export interface CreateServoGroupRequest{
    name: string
    num_servos: number
    column: ColumnEnum
    robot_id: number
}

export interface UpdateServoGroupNumServosRequest{
    num_servos: number
}

export interface UpdateServoGroupNameRequest{
    name: string
}