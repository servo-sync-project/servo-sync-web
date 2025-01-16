export interface ServoAngleJson{
    id: number
    angle: number
}

export interface ServoGroupJson{    
    id: number
    name: string
    servo_angles: ServoAngleJson[]
}    
//column: ColumnEnum
//sequence: number