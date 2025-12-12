package com.tegar.fullstack.backend.exception;

import java.util.Map;

public class BusinessException extends RuntimeException {
    private final Map<String, String> errors;

    public BusinessException(String message) {
        super(message);
        this.errors = Map.of();
    }

    public BusinessException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
