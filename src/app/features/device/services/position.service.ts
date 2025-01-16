import { Injectable } from '@angular/core';
import { CreatePositionRequest, UpdatePositionRequest } from '../models/PositionRequest';
import { PositionResponse } from '../models/PositionResponse';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { URL_SERVICIOS } from '../../../core/config/config';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  constructor(
    private httpClient: HttpClient
  ) {}

  createPosition(request: CreatePositionRequest) {
    let URL = URL_SERVICIOS + "/positions";
    return this.httpClient.post<PositionResponse>(URL, request);
  }  

  getAllPositionsByMovementId(movementId: number){
    let URL = URL_SERVICIOS + "/positions/movement/" + movementId;
    return this.httpClient.get<PositionResponse[]>(URL);
  }

  updatePositionById(positionId: number, request: UpdatePositionRequest) {
    let URL = URL_SERVICIOS + "/positions/" + positionId;
    return this.httpClient.put<PositionResponse>(URL, request);
  }  

  deletePositionById(positionId: number){
    let URL = URL_SERVICIOS + "/positions/" + positionId;
    return this.httpClient.delete<boolean>(URL);
  }

  increasePositionSequenceById(positionId: number) {
    let URL = URL_SERVICIOS + "/positions/" + positionId + "/increase";
    return this.httpClient.put<PositionResponse>(URL, {});
  }  

  decreasePositionSequenceById(positionId: number) {
    let URL = URL_SERVICIOS + "/positions/" + positionId + "/decrease";
    return this.httpClient.put<PositionResponse>(URL, {});
  }  
}
