package com.cs5600.graphql;

import com.cs5600.service.LlmCommandService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class LlmGraphQLController {

    private final LlmCommandService llmCommandService;

    public LlmGraphQLController(LlmCommandService llmCommandService) {
        this.llmCommandService = llmCommandService;
    }

    @MutationMapping
    public String llmCommand(@Argument String prompt, @Argument String userId, @Argument String role) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required");
        }
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException("role is required");
        }
        return llmCommandService.handleCommand(prompt, userId, role);
    }
}
