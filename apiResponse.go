package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type apiResponse struct {
	Code  int         `json:"-"`
	Error string      `json:"error,omitempty"`
	Data  interface{} `json:"data,omitempty"`
	Token string      `json:"token,omitempty"`
}

var errAPINotFound = apiResponse{http.StatusNotFound, "not found", nil, ""}
var errAPIBadRequest = apiResponse{http.StatusBadRequest, "bad request", nil, ""}

var errorMapping = map[string]*apiResponse{
	"sql: no rows in result set": &errAPINotFound,
}

func CreateAPIResponse(statusCode int, data interface{}, err error) apiResponse {
	if err != nil {
		var mapped = errorMapping[err.Error()]
		if mapped != nil {
			return *mapped
		}
		return apiResponse{http.StatusInternalServerError, err.Error(), nil, ""}
	}
	if statusCode == 0 {
		statusCode = http.StatusOK
	}
	return apiResponse{statusCode, "", data, ""}
}

func CreateAPIError(err error) apiResponse {
	return CreateAPIResponse(0, nil, err)
}

func SendResponse(reply apiResponse, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(reply.Code)
	err := json.NewEncoder(w).Encode(reply)
	if err != nil {
		log.Println("While sending HTTP reply:", err)
	}
}
