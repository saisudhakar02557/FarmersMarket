package com.cs5600.graphql;

import com.cs5600.model.Category;
import com.cs5600.model.Product;
import com.cs5600.service.CategoryService;
import com.cs5600.service.ProductService;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class CatalogGraphQLController {

    private final CategoryService categoryService;
    private final ProductService productService;

    public CatalogGraphQLController(CategoryService categoryService, ProductService productService) {
        this.categoryService = categoryService;
        this.productService = productService;
    }

    @MutationMapping
    public Category createCategory(@Argument("input") Map<String, String> input) {
        return categoryService.create(input.get("name"));
    }

    @MutationMapping
    public Product createProduct(@Argument("input") Map<String, String> input) {
        Product p = new Product();
        p.setName(input.get("name"));
        p.setDescription(input.get("description"));
        p.setCategoryId(input.get("categoryId"));
        return productService.create(p);
    }

    @QueryMapping
    public List<Category> categories() {
        return categoryService.all();
    }

    @QueryMapping
    public List<Product> products() {
        return productService.all();
    }

    @QueryMapping
    public List<Product> productsByCategory(@Argument String categoryId) {
        return productService.byCategory(categoryId);
    }
}
