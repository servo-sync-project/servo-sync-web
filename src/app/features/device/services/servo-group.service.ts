import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { URL_SERVICIOS } from '../../../core/config/config';
import { AuthStorageService } from '../../../core/services/auth-storage.service';
import { ServoGroupResponse } from '../models/ServoGroupResponse';
import { CreateServoGroupRequest, UpdateServoGroupNameRequest, UpdateServoGroupNumServosRequest } from '../models/ServoGroupRequest';

@Injectable({
  providedIn: 'root'
})
export class ServoGroupService {
  constructor(
    private httpClient: HttpClient
  ) {}

  createServoGroup(request: CreateServoGroupRequest) {
    let URL = URL_SERVICIOS + "/servo-groups";
    return this.httpClient.post<ServoGroupResponse>(URL, request);
  }  

  deleteServoGroup(servoGroupId: number) {
    let URL = URL_SERVICIOS + "/servo-groups/" + servoGroupId;
    return this.httpClient.delete<boolean>(URL);
  }  

  getAllServoGroupsByRobotId(robotId: number){
    let URL = URL_SERVICIOS + "/servo-groups/robot/" + robotId;
    return this.httpClient.get<ServoGroupResponse[]>(URL);
  }

  updateServoGroupNameById(servoGroupId: number, request: UpdateServoGroupNameRequest){
    let URL = URL_SERVICIOS + "/servo-groups/" + servoGroupId + "/name";
    return this.httpClient.put<ServoGroupResponse>(URL, request);
  }

  updateServoGroupNumServosById(servoGroupId: number, request: UpdateServoGroupNumServosRequest){
    let URL = URL_SERVICIOS + "/servo-groups/" + servoGroupId + "/num-servos";
    return this.httpClient.put<ServoGroupResponse>(URL, request);
  }

  increaseServoGroupSequenceById(servoGroupId: number){
    let URL = URL_SERVICIOS + "/servo-groups/" + servoGroupId + "/increase";
    return this.httpClient.put<ServoGroupResponse>(URL, {});
  }

  decreaseServoGroupSequenceById(servoGroupId: number){
    let URL = URL_SERVICIOS + "/servo-groups/" + servoGroupId + "/decrease";
    return this.httpClient.put<ServoGroupResponse>(URL, {});
  }
}
