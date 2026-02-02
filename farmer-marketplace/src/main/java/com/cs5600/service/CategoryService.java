package com.cs5600.service;

import com.cs5600.model.Category;
import com.cs5600.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    public Category create(String name) {
        repo.findByName(name).ifPresent(c -> {
            throw new RuntimeException("Category already exists");
        });
        return repo.save(new Category(name));
    }

    public List<Category> all() {
        return repo.findAll();
    }
}
