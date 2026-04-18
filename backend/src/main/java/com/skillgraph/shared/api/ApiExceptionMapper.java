package com.skillgraph.shared.api;

import com.skillgraph.shared.domain.ApiException;
import com.skillgraph.shared.domain.BadRequestException;
import com.skillgraph.shared.domain.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable throwable) {
        if (throwable instanceof ApiException apiException) {
            return build(apiException.status(), apiException.getMessage());
        }
        if (throwable instanceof IllegalArgumentException illegalArgumentException) {
            return build(Response.Status.BAD_REQUEST.getStatusCode(), illegalArgumentException.getMessage());
        }
        return build(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), throwable.getMessage() == null ? "Unexpected server error" : throwable.getMessage());
    }

    private Response build(int status, String message) {
        return Response.status(status)
            .type(MediaType.APPLICATION_JSON)
            .entity(new ErrorResponse(status, message))
            .build();
    }

    public record ErrorResponse(int status, String message) {
    }
}
