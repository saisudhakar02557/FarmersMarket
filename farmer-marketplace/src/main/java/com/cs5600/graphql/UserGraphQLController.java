package com.cs5600.graphql;

import com.cs5600.model.User;
import com.cs5600.service.UserService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class UserGraphQLController {

    private final UserService service;

    public UserGraphQLController(UserService service) {
        this.service = service;
    }

    @QueryMapping
    public List<User> users() {
        return service.users();
    }

    @QueryMapping
    public List<User> usersByRole(@Argument String role) {
        return service.usersByRole(role);
    }

    @MutationMapping
    public User registerUser(@Argument("input") Map<String, Object> input) {
        User u = new User();
        u.setRole((String) input.get("role"));
        u.setFirstName((String) input.get("firstName"));
        u.setLastName((String) input.get("lastName"));
        u.setEmail((String) input.get("email"));
        u.setPassword((String) input.get("password"));
        u.setPhone((String) input.get("phone"));
        u.setZipCode((String) input.get("zipCode"));
        return service.register(u);
    }

    @MutationMapping
    public User approveManager(@Argument String managerId) {
        return service.approveManager(managerId);
    }
}
