import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '../../../core/config/config';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthStorageService } from '../../../core/services/auth-storage.service';
import { catchError, throwError } from 'rxjs';
import { CreateMovementRequest, UpdateMovementRequest } from '../models/MovementRequest';
import { MovementResponse } from '../models/MovementResponse';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  constructor(
    private httpClient: HttpClient
  ) {}

  createMovement(request: CreateMovementRequest) {
    let URL = URL_SERVICIOS + "/movements";
    return this.httpClient.post<MovementResponse>(URL, request);
  }  

  getAllMovementsByRobotId(robotId: number){
    let URL = URL_SERVICIOS + "/movements/robot/" + robotId;
    return this.httpClient.get<MovementResponse[]>(URL);
  }

  updateMovementById(movementId: number, request: UpdateMovementRequest) {
    let URL = URL_SERVICIOS + "/movements/" + movementId;
    return this.httpClient.put<MovementResponse>(URL, request);
  }  

  deleteMovementById(movementId: number){
    let URL = URL_SERVICIOS + "/movements/" + movementId;
    return this.httpClient.delete<boolean>(URL);
  }
}
