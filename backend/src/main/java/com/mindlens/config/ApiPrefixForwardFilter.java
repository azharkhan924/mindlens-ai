package com.mindlens.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(0)
public class ApiPrefixForwardFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String contextPath = httpRequest.getContextPath();
        String requestUri = httpRequest.getRequestURI();
        String apiPrefix = contextPath + "/api";

        if (requestUri.equals(apiPrefix) || requestUri.startsWith(apiPrefix + "/")) {
            String strippedPath = requestUri.substring(apiPrefix.length());
            String forwardPath = strippedPath.isBlank() ? "/" : strippedPath;
            httpRequest.getRequestDispatcher(forwardPath).forward(request, response);
            return;
        }

        chain.doFilter(request, response);
    }
}
