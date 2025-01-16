import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { URL_SERVICIOS } from '../../../core/config/config';
import { AuthStorageService } from '../../../core/services/auth-storage.service';
import { CreateRobotRequest, UpdateRobotRequest, UpdateCurrentPositionRequest, UpdateInitialPositionRequest } from '../models/RobotRequest';
import { RobotResponse, RobotResponseForAll } from '../models/RobotResponse';

@Injectable({
  providedIn: 'root'
})
export class RobotService {
  
  constructor(
    private httpClient: HttpClient
  ) {}

  createRobot(request: CreateRobotRequest) {
    let URL = URL_SERVICIOS + "/robots";
    return this.httpClient.post<RobotResponse>(URL, request);
  }  

  getAllRobotsForAll(){
    let URL = URL_SERVICIOS + "/robots";
    return this.httpClient.get<RobotResponseForAll[]>(URL);
  }

  getAllRobotsByMy(){
    let URL = URL_SERVICIOS + "/robots/my";
    return this.httpClient.get<RobotResponse[]>(URL);
  }

  updateRobotById(robotId: number, request: UpdateRobotRequest) {
    let URL = URL_SERVICIOS + "/robots/" + robotId;
    return this.httpClient.put<RobotResponse>(URL, request);
  }  

  updateImageById(robotId: number, imageFile: File){
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/image";
    return this.httpClient.put<RobotResponse>(URL, formData);
  }

  updateConfigImageById(robotId: number, configImageFile: File){
    const formData = new FormData();
    formData.append('configImageFile', configImageFile);
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/config-image";
    return this.httpClient.put<RobotResponse>(URL, formData);
  }

  deleteRobotById(robotId: number){
    let URL = URL_SERVICIOS + "/robots/" + robotId;
    return this.httpClient.delete<boolean>(URL);
  }

  moveToInitialPositionById(robotId: number){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/move/initial-position";
    return this.httpClient.post<boolean>(URL, {});
  }

  updateAndmoveToInitialPositionById(robotId: number, request: UpdateInitialPositionRequest){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/move/initial-position";
    return this.httpClient.put<RobotResponse>(URL, request);
  }

  updateAndMoveToCurrentPositionById(robotId: number, request: UpdateCurrentPositionRequest){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/move/current-position";
    return this.httpClient.put<RobotResponse>(URL, request);
  }

  getRobotByUniqueUid(uniqueUid: string){
    let URL = URL_SERVICIOS + "/robots/uuid/" + uniqueUid;
    return this.httpClient.get<RobotResponse>(URL);
  }

  executeMovementByIdAndYourId(robotId: number, movementId: number){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/movements/" + movementId + "/execute";
    return this.httpClient.post<boolean>(URL, {});
  }

  moveToPositionByIdAndYourId(robotId: number, positionId: number){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/movements/positions/" + positionId + "/move";
    return this.httpClient.post<boolean>(URL, {});
  }
  
  saveMovementInLocalByIdAndYourId(robotId: number, movementId: number) {
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/storage/movements/" + movementId;
    return this.httpClient.put<boolean>(URL, {});
  }  

  deleteMovementInLocalByIdAndYourId(robotId: number, movementId: number){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/storage/movements/" + movementId;
    return this.httpClient.delete<boolean>(URL);
  }

  saveInitialPositionInLocalById(robotId: number){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/storage/initial-position";
    return this.httpClient.put<boolean>(URL, {});
  }

  clearLocalStorageById(robotId: number){
    let URL = URL_SERVICIOS + "/robots/" + robotId + "/storage";
    return this.httpClient.delete<boolean>(URL);
  }
}

// const params = new HttpParams()
// .set('type', type)
// .set('page', page.toString())
// .set('size', size.toString());