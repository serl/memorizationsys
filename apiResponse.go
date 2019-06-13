package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

type apiResponse struct {
	Code  int
	Error error
	Data  interface{}
	Token string
}

func (r apiResponse) MarshalJSON() ([]byte, error) {
	errMessage := ""
	if r.Error != nil {
		errMessage = r.Error.Error()
	}
	return json.Marshal(struct {
		Error string      `json:"error,omitempty"`
		Data  interface{} `json:"data,omitempty"`
		Token string      `json:"token,omitempty"`
	}{
		Error: errMessage,
		Data:  r.Data,
		Token: r.Token,
	})
}

var errAPINotFound = apiResponse{http.StatusNotFound, errors.New("not found"), nil, ""}
var errAPIBadRequest = apiResponse{http.StatusBadRequest, errors.New("bad request"), nil, ""}

var errorMapping = map[string]*apiResponse{
	"sql: no rows in result set": &errAPINotFound,
}

func CreateAPIResponse(statusCode int, data interface{}, err error) apiResponse {
	if err != nil {
		var mapped = errorMapping[err.Error()]
		if mapped != nil {
			return *mapped
		}
		return apiResponse{http.StatusInternalServerError, err, nil, ""}
	}
	if statusCode == 0 {
		statusCode = http.StatusOK
	}
	return apiResponse{statusCode, nil, data, ""}
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
