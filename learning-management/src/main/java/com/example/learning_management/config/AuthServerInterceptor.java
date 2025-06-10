package com.example.learning_management.config;

import com.example.learning_management.security.JwtService;
import io.grpc.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class AuthServerInterceptor implements ServerInterceptor {

    @Autowired
    private JwtService jwtService;

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {
        String token = headers.get(Metadata.Key.of("Authorization", Metadata.ASCII_STRING_MARSHALLER));

        if (token == null || !token.startsWith("Bearer ")) {
            call.close(Status.UNAUTHENTICATED.withDescription("Authorization token is missing or invalid"), headers);
            return new ServerCall.Listener<>() {};
        }

        token = token.substring(7);
        if (!jwtService.isTokenValid(token)) {
            call.close(Status.UNAUTHENTICATED.withDescription("Authorization token is invalid"), headers);
            return new ServerCall.Listener<>() {};
        }

        String username = jwtService.extractUserName(token);
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        return Contexts.interceptCall(Context.current(), call, headers, next);
    }
}