package com.skillgraph.shared.domain;

public final class BadRequestException extends ApiException {
    public BadRequestException(String message) {
        super(400, message);
    }
}
